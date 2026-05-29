package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private UUID userId;
    private String displayName;
    private String avatarUrl;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalXp;
    private Integer totalLessonsCompleted;
    private Integer totalPerfectScores;
    private Integer streakFreezes;
    private LocalDate lastActivity;
    private Integer globalRank;
    private Integer weeklyRank;
    private List<UserBadgeDto> badges;
}
