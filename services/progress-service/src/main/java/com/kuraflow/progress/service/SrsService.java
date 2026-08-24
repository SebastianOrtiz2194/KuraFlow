package com.kuraflow.progress.service;

import com.kuraflow.progress.dto.SrsDeckSummaryResponse;
import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.dto.SrsStatsResponse;
import com.kuraflow.progress.entity.SrsCard;

import java.util.List;
import java.util.UUID;

public interface SrsService {
    SrsCard reviewCard(UUID userId, UUID flashcardId, SrsReviewRequest request);
    List<SrsCard> getDueCards(UUID userId);
    SrsStatsResponse getSrsStats(UUID userId);
    SrsDeckSummaryResponse getDeckSummary(UUID userId, UUID deckId);
}
