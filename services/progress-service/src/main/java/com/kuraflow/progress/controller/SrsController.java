package com.kuraflow.progress.controller;

import com.kuraflow.progress.dto.SrsDeckSummaryResponse;
import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.dto.SrsStatsResponse;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.service.SrsService;
import com.kuraflow.shared.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress/srs")
@RequiredArgsConstructor
@Tag(name = "SRS API", description = "Spaced Repetition System review, due cards, and mastery analytics")
public class SrsController {

    private final SrsService srsService;

    @PostMapping("/cards/{flashcardId}/review")
    @Operation(summary = "Submit a flashcard review with SM-2 quality rating (0-5)")
    public ResponseEntity<SrsCard> reviewCard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID flashcardId,
            @Valid @RequestBody SrsReviewRequest request) {

        SrsCard card = srsService.reviewCard(userDetails.getId(), flashcardId, request);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/cards/due")
    @Operation(summary = "Get list of flashcards due for review")
    public ResponseEntity<List<SrsCard>> getDueCards(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<SrsCard> dueCards = srsService.getDueCards(userDetails.getId());
        return ResponseEntity.ok(dueCards);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user's overall SRS retention, distribution, and review stats")
    public ResponseEntity<SrsStatsResponse> getSrsStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(srsService.getSrsStats(userDetails.getId()));
    }

    @GetMapping("/decks/{deckId}/summary")
    @Operation(summary = "Get mastery summary for a specific flashcard deck")
    public ResponseEntity<SrsDeckSummaryResponse> getDeckSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID deckId) {
        return ResponseEntity.ok(srsService.getDeckSummary(userDetails.getId(), deckId));
    }
}
