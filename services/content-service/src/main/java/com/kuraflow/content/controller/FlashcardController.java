package com.kuraflow.content.controller;

import com.kuraflow.content.dto.FlashcardResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.service.FlashcardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/content/flashcards")
@RequiredArgsConstructor
@Tag(name = "Flashcard API", description = "Endpoints for retrieving flashcard content")
public class FlashcardController {

    private final FlashcardService flashcardService;

    @GetMapping
    @Operation(summary = "Get flashcards by deck (paginated)")
    public ResponseEntity<PagedResponse<FlashcardResponse>> getFlashcardsByDeck(
            @RequestParam UUID deckId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(flashcardService.getFlashcardsByDeck(deckId, pageNo, pageSize));
    }

    @GetMapping("/search")
    @Operation(summary = "Get flashcards by tag (paginated)")
    public ResponseEntity<PagedResponse<FlashcardResponse>> getFlashcardsByTag(
            @RequestParam String tag,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(flashcardService.getFlashcardsByTag(tag, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flashcard by ID")
    public ResponseEntity<FlashcardResponse> getFlashcardById(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardService.getFlashcardById(id));
    }
}
