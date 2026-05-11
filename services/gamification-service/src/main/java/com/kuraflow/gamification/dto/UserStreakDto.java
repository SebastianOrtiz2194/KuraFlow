package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStreakDto {
    private UUID userId;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastActivity;
    private Integer streakFreezes;
    private Integer totalXp;
}
