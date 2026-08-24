package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityHeatmapDto {
    private LocalDate date;
    private int count;
    private int xp;
    private int level; // 0: None, 1: Low, 2: Medium, 3: High, 4: Max
}
