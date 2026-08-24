package com.kuraflow.gamification.service;

import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.UserStreakRepository;
import com.kuraflow.shared.event.StreakUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserStreakRepository userStreakRepository;
    private final BadgeService badgeService;
    private final LeaderboardService leaderboardService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.streak-updated:streak.updated}")
    private String streakUpdatedTopic;

    private ZoneId getUserZoneId(UUID userId) {
        return ZoneId.of("UTC");
    }

    @Transactional
    public void processActivity(UUID userId, Instant activityTimestamp, int xpEarned, 
                               boolean isLessonCompletion, double score) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .totalLessonsCompleted(0)
                        .totalPerfectScores(0)
                        .build());

        streak.setTotalXp(streak.getTotalXp() + xpEarned);
        
        if (isLessonCompletion) {
            streak.setTotalLessonsCompleted(streak.getTotalLessonsCompleted() + 1);
            if (score >= 100.0) {
                streak.setTotalPerfectScores(streak.getTotalPerfectScores() + 1);
            }
        }

        ZoneId userZone = getUserZoneId(userId);
        LocalDate activityDate = activityTimestamp.atZone(userZone).toLocalDate();
        boolean isNewRecord = false;
        boolean streakChanged = false;

        if (streak.getLastActivity() == null) {
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
            streak.setLastActivity(activityDate);
            streakChanged = true;
            isNewRecord = true;
        } else {
            LocalDate lastActivityDate = streak.getLastActivity();
            
            if (activityDate.isEqual(lastActivityDate)) {
                log.debug("User {} already active today", userId);
            } else if (activityDate.isEqual(lastActivityDate.plusDays(1))) {
                streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                streakChanged = true;
                if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                    streak.setLongestStreak(streak.getCurrentStreak());
                    isNewRecord = true;
                }
                streak.setLastActivity(activityDate);
            } else if (activityDate.isAfter(lastActivityDate.plusDays(1))) {
                long daysMissed = java.time.temporal.ChronoUnit.DAYS.between(lastActivityDate, activityDate) - 1;
                
                if (streak.getStreakFreezes() >= daysMissed) {
                    log.info("Streak rescued by {} freezes for user {}", daysMissed, userId);
                    streak.setStreakFreezes((int) (streak.getStreakFreezes() - daysMissed));
                    streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                    streakChanged = true;
                    if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                        streak.setLongestStreak(streak.getCurrentStreak());
                        isNewRecord = true;
                    }
                } else {
                    log.info("Streak reset for user {}", userId);
                    streak.setCurrentStreak(1);
                    streakChanged = true;
                }
                streak.setLastActivity(activityDate);
            } else {
                log.debug("Activity date {} is before last activity {}, ignoring for streak", activityDate, lastActivityDate);
            }
        }

        userStreakRepository.save(streak);
        log.info("Updated streak for user {}: current={}, totalXp={}", userId, streak.getCurrentStreak(), streak.getTotalXp());
        
        // Publish streak.updated event to Kafka
        if (streakChanged) {
            try {
                StreakUpdatedEvent event = StreakUpdatedEvent.builder()
                        .userId(userId)
                        .currentStreak(streak.getCurrentStreak())
                        .isNewRecord(isNewRecord)
                        .timestamp(System.currentTimeMillis())
                        .build();
                kafkaTemplate.send(streakUpdatedTopic, userId.toString(), event);
                log.info("Published StreakUpdatedEvent for user: {}", userId);
            } catch (Exception e) {
                log.error("Failed to publish StreakUpdatedEvent for user: {}", userId, e);
            }
        }

        // Update leaderboard
        leaderboardService.addXp(userId, xpEarned);
        
        // Evaluate badges
        String eventType = isLessonCompletion ? "LESSON_COMPLETED" : "ACTIVITY";
        java.util.Map<String, Object> eventData = new java.util.HashMap<>();
        eventData.put("score", score);
        badgeService.evaluateBadges(userId, eventType, eventData);
    }

    @Transactional(readOnly = true)
    public UserStreak getUserStreakEntity(UUID userId) {
        return userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .totalLessonsCompleted(0)
                        .totalPerfectScores(0)
                        .build());
    }

    public com.kuraflow.gamification.dto.UserStreakDto getUserStreak(UUID userId) {
        return convertToDto(getUserStreakEntity(userId));
    }

    @Transactional
    public void purchaseFreeze(UUID userId) {
        UserStreak streak = getUserStreakEntity(userId);
        int cost = 100;
        
        if (streak.getTotalXp() < cost) {
            throw new IllegalStateException("Not enough XP to purchase a streak freeze. Need " + cost + " XP.");
        }
        
        streak.setTotalXp(streak.getTotalXp() - cost);
        streak.setStreakFreezes(streak.getStreakFreezes() + 1);
        userStreakRepository.save(streak);
        log.info("User {} purchased a streak freeze for {} XP", userId, cost);
    }

    @Transactional
    public void cleanupExpiredStreaks() {
        LocalDate yesterday = LocalDate.now(ZoneId.of("UTC")).minusDays(1);
        log.info("Cleaning up streaks that expired before {}", yesterday);
        
        userStreakRepository.findAll().stream()
            .filter(s -> s.getLastActivity() != null && s.getLastActivity().isBefore(yesterday))
            .filter(s -> s.getCurrentStreak() > 0)
            .forEach(s -> {
                log.info("Proactively resetting streak for user {} (last active: {})", s.getUserId(), s.getLastActivity());
                s.setCurrentStreak(0);
                userStreakRepository.save(s);
            });
    }

    private com.kuraflow.gamification.dto.UserStreakDto convertToDto(UserStreak streak) {
        return com.kuraflow.gamification.dto.UserStreakDto.builder()
                .userId(streak.getUserId())
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .lastActivity(streak.getLastActivity())
                .streakFreezes(streak.getStreakFreezes())
                .totalXp(streak.getTotalXp())
                .build();
    }
}
