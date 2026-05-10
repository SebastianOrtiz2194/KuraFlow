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

    @Transactional
    public void addFreeze(UUID userId, int freezesToAdd) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longest_streak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .build());
        streak.setStreakFreezes(streak.getStreakFreezes() + freezesToAdd);
        userStreakRepository.save(streak);
        log.info("Added {} freezes to user {}. Total freezes: {}", freezesToAdd, userId, streak.getStreakFreezes());
    }
}
