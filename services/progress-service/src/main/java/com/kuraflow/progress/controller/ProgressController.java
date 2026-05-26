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

    // TODO (Sprint 13): Extract userId from JWT SecurityContext once global security is implemented.
    // For now, we are using the 'X-User-Id' header for service-to-service and testing purposes.
    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> saveLessonProgress(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @PathVariable UUID lessonId,
            @Valid @RequestBody SaveProgressRequest request) {
        
        UserProgress progress = progressService.saveLessonProgress(userDetails.getId(), lessonId, request);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<UserProgress> getLessonProgress(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @PathVariable UUID lessonId) {
        
        UserProgress progress = progressService.getLessonProgress(userDetails.getId(), lessonId);
        return ResponseEntity.ok(progress);
    }
}
