package com.kuraflow.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SrsDeckSummaryResponse {
    private UUID deckId;
    private long totalCards;
    private long reviewedCards;
    private long graduatedCards;
    private double masteryPercentage;
    private long dueCards;
}
