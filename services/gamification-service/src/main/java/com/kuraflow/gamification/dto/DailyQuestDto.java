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
public class DailyQuestDto {
    private UUID id;
    private UUID userId;
    private LocalDate questDate;
    private String questType;
    private String title;
    private String description;
    private int targetCount;
    private int currentCount;
    private int xpReward;
    private boolean isCompleted;
    private boolean isClaimed;
    private double progressPercentage;
}
