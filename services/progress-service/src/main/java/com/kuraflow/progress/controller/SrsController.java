package com.kuraflow.progress.controller;

import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.service.SrsService;
import com.kuraflow.shared.security.CustomUserDetails;
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
public class SrsController {

    private final SrsService srsService;

    @PostMapping("/cards/{flashcardId}/review")
    public ResponseEntity<SrsCard> reviewCard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID flashcardId,
            @Valid @RequestBody SrsReviewRequest request) {

        SrsCard card = srsService.reviewCard(userDetails.getId(), flashcardId, request);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/cards/due")
    public ResponseEntity<List<SrsCard>> getDueCards(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<SrsCard> dueCards = srsService.getDueCards(userDetails.getId());
        return ResponseEntity.ok(dueCards);
    }
}
