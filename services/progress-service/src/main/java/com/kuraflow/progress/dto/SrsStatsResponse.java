package com.kuraflow.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SrsStatsResponse {
    private long totalCards;
    private long learningCount;
    private long reviewCount;
    private long graduatedCount;
    private long dueTodayCount;
    private long dueTomorrowCount;
    private double retentionRate;
    private double averageEaseFactor;
    private int totalRepetitions;
    private Map<String, Long> statusDistribution;
}
