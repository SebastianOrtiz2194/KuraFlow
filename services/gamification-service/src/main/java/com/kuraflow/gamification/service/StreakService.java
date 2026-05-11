package com.kuraflow.gamification.service;

import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    
    // In a real app, this would fetch from user-service
    // For now, we assume UTC
    private ZoneId getUserZoneId(UUID userId) {
        return ZoneId.of("UTC");
    }

    @Transactional
    public void processActivity(UUID userId, Instant activityTimestamp, int xpEarned) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longest_streak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .build());

        streak.setTotalXp(streak.getTotalXp() + xpEarned);

        ZoneId userZone = getUserZoneId(userId);
        LocalDate activityDate = activityTimestamp.atZone(userZone).toLocalDate();

        if (streak.getLastActivity() == null) {
            streak.setCurrentStreak(1);
            streak.setLongest_streak(1);
            streak.setLastActivity(activityDate);
        } else {
            LocalDate lastActivityDate = streak.getLastActivity();
            
            if (activityDate.isEqual(lastActivityDate)) {
                // Already active today, do nothing to streak
                log.debug("User {} already active today", userId);
            } else if (activityDate.isEqual(lastActivityDate.plusDays(1))) {
                // Active on consecutive day
                streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                if (streak.getCurrentStreak() > streak.getLongest_streak()) {
                    streak.setLongest_streak(streak.getCurrentStreak());
                }
                streak.setLastActivity(activityDate);
            } else if (activityDate.isAfter(lastActivityDate.plusDays(1))) {
                // Streak broken, check for freezes
                long daysMissed = java.time.temporal.ChronoUnit.DAYS.between(lastActivityDate, activityDate) - 1;
                
                if (streak.getStreakFreezes() >= daysMissed) {
                    log.info("Streak rescued by {} freezes for user {}", daysMissed, userId);
                    streak.setStreakFreezes((int) (streak.getStreakFreezes() - daysMissed));
                    streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                    if (streak.getCurrentStreak() > streak.getLongest_streak()) {
                        streak.setLongest_streak(streak.getCurrentStreak());
                    }
                } else {
                    log.info("Streak reset for user {}", userId);
                    streak.setCurrentStreak(1);
                }
                streak.setLastActivity(activityDate);
            } else {
                // activityDate is before lastActivityDate (e.g. late event)
                // We ignore it for streak purposes
                log.debug("Activity date {} is before last activity {}, ignoring for streak", activityDate, lastActivityDate);
            }
        }

        userStreakRepository.save(streak);
        log.info("Updated streak for user {}: current={}, totalXp={}", userId, streak.getCurrentStreak(), streak.getTotalXp());
    }

    @Transactional(readOnly = true)
    public UserStreak getUserStreakEntity(UUID userId) {
        return userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longest_streak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .build());
    }

    public com.kuraflow.gamification.dto.UserStreakDto getUserStreak(UUID userId) {
        return convertToDto(getUserStreakEntity(userId));
    }

    @Transactional
    public void purchaseFreeze(UUID userId) {
        UserStreak streak = getUserStreakEntity(userId);
        int cost = 100; // Hardcoded cost for now
        
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
        // This is a simplified proactive cleanup. 
        // Real implementation would handle per-user timezones.
        log.info("Cleaning up streaks that expired before {}", yesterday);
        
        // Fetch users who haven't been active since before yesterday
        // For brevity in this sprint, we are using a simple list all and filter.
        // In production, use a custom repository query.
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
                .longestStreak(streak.getLongest_streak())
                .lastActivity(streak.getLastActivity())
                .streakFreezes(streak.getStreakFreezes())
                .totalXp(streak.getTotalXp())
                .build();
    }
}
