package com.kuraflow.progress.controller;

import com.kuraflow.progress.dto.SaveProgressRequest;
import com.kuraflow.progress.entity.UserProgress;
import com.kuraflow.progress.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    // TODO: In a real scenario, extract userId from JWT SecurityContext.
    // For now, we will pass it as a header or assume a fixed user for testing.
    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> saveLessonProgress(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID lessonId,
            @Valid @RequestBody SaveProgressRequest request) {
        
        UserProgress progress = progressService.saveLessonProgress(userId, lessonId, request);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> getLessonProgress(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID lessonId) {
        
        UserProgress progress = progressService.getLessonProgress(userId, lessonId);
        return ResponseEntity.ok(progress);
    }
}
