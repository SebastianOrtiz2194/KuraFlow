package com.kuraflow.gamification.service;

import com.kuraflow.gamification.entity.Badge;
import com.kuraflow.gamification.entity.UserBadge;
import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.BadgeRepository;
import com.kuraflow.gamification.repository.UserBadgeRepository;
import com.kuraflow.gamification.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserStreakRepository userStreakRepository;

    @Transactional
    public void evaluateBadges(UUID userId, String eventType, Map<String, Object> eventData) {
        log.info("Evaluating badges for user {} on event {}", userId, eventType);
        
        List<Badge> allBadges = badgeRepository.findAll();
        UserStreak streak = userStreakRepository.findByUserId(userId).orElse(null);

        if (streak == null) {
            log.warn("No streak record found for user {}, skipping badge evaluation", userId);
            return;
        }

        for (Badge badge : allBadges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
                continue;
            }

            if (isEligible(badge, streak, eventType, eventData)) {
                awardBadge(userId, badge, streak);
            }
        }
    }

    private boolean isEligible(Badge badge, UserStreak streak, String eventType, Map<String, Object> eventData) {
        Map<String, Object> criteria = badge.getCriteria();
        String type = (String) criteria.get("type");
        Object thresholdObj = criteria.get("threshold");
        Integer threshold = thresholdObj instanceof Integer ? (Integer) thresholdObj : 
                           (thresholdObj instanceof Long ? ((Long) thresholdObj).intValue() : 0);

        switch (type) {
            case "streak":
                return streak.getCurrentStreak() >= threshold;
            case "xp":
                return streak.getTotalXp() >= threshold;
            case "completion":
                String subtype = (String) criteria.get("subtype");
                if ("module".equals(subtype)) {
                    // Placeholder: in a real app, we'd check module completion count
                    return false; 
                }
                if ("level".equals(subtype)) {
                    // Placeholder: in a real app, we'd check level up events
                    return "LEVEL_UP".equals(eventType);
                }
                return streak.getTotalLessonsCompleted() >= threshold;
            case "mastery":
                String masterySubtype = (String) criteria.get("subtype");
                if ("perfect_score".equals(masterySubtype)) {
                    return streak.getTotalPerfectScores() >= threshold;
                }
                return false;
            default:
                return false;
        }
    }

    private void awardBadge(UUID userId, Badge badge, UserStreak streak) {
        log.info("Awarding badge {} to user {}", badge.getCode(), userId);
        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);
        
        // Award XP if defined
        if (badge.getXpReward() > 0) {
            streak.setTotalXp(streak.getTotalXp() + badge.getXpReward());
            userStreakRepository.save(streak);
            log.info("Awarded {} bonus XP to user {} for badge {}", badge.getXpReward(), userId, badge.getCode());
        }
    }
}
