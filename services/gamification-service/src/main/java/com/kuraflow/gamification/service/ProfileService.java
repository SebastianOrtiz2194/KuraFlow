package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.UserBadgeDto;
import com.kuraflow.gamification.dto.UserProfileDto;
import com.kuraflow.gamification.entity.UserBadge;
import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final StreakService streakService;
    private final LeaderboardService leaderboardService;
    private final UserBadgeRepository userBadgeRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(UUID userId) {
        UserStreak streak = streakService.getUserStreakEntity(userId);
        List<UserBadgeDto> badges = getUserBadges(userId);
        Integer globalRank = leaderboardService.getAllTimeRank(userId);
        Integer weeklyRank = leaderboardService.getWeeklyRank(userId);

        return UserProfileDto.builder()
                .userId(userId)
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .totalXp(streak.getTotalXp())
                .totalLessonsCompleted(streak.getTotalLessonsCompleted())
                .totalPerfectScores(streak.getTotalPerfectScores())
                .streakFreezes(streak.getStreakFreezes())
                .lastActivity(streak.getLastActivity())
                .globalRank(globalRank)
                .weeklyRank(weeklyRank)
                .badges(badges)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserBadgeDto> getUserBadges(UUID userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        return userBadges.stream()
                .map(ub -> UserBadgeDto.builder()
                        .badgeId(ub.getBadge().getId())
                        .code(ub.getBadge().getCode())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .iconUrl(ub.getBadge().getIconUrl())
                        .category(ub.getBadge().getCategory())
                        .xpReward(ub.getBadge().getXpReward())
                        .earnedAt(ub.getEarnedAt())
                        .build())
                .toList();
    }
}
