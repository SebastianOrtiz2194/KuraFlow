package com.kuraflow.progress.controller;

import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.service.SrsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/srs")
@RequiredArgsConstructor
public class SrsController {

    private final SrsService srsService;

    @PostMapping("/cards/{flashcardId}/review")
    public ResponseEntity<SrsCard> reviewCard(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID flashcardId,
            @Valid @RequestBody SrsReviewRequest request) {

        SrsCard card = srsService.reviewCard(userId, flashcardId, request);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/cards/due")
    public ResponseEntity<List<SrsCard>> getDueCards(
            @RequestHeader("X-User-Id") UUID userId) {

        List<SrsCard> dueCards = srsService.getDueCards(userId);
        return ResponseEntity.ok(dueCards);
    }
}
