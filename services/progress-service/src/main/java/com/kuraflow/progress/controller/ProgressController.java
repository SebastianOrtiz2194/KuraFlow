package com.kuraflow.progress.controller;

import com.kuraflow.progress.dto.SaveProgressRequest;
import com.kuraflow.progress.entity.UserProgress;
import com.kuraflow.progress.service.ProgressService;
import com.kuraflow.shared.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public ResponseEntity<List<UserProgress>> getUserProgressList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(progressService.getUserProgressList(userDetails.getId()));
    }

    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> saveLessonProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID lessonId,
            @Valid @RequestBody SaveProgressRequest request) {
        
        UserProgress progress = progressService.saveLessonProgress(userDetails.getId(), lessonId, request);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> getLessonProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID lessonId) {
        
        UserProgress progress = progressService.getLessonProgress(userDetails.getId(), lessonId);
        return ResponseEntity.ok(progress);
    }
}
