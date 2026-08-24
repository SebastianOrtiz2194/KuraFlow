package com.kuraflow.content.controller;

import com.kuraflow.content.dto.practice.PracticeQuizResponse;
import com.kuraflow.content.service.PracticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/content/practice")
@RequiredArgsConstructor
@Tag(name = "Practice API", description = "Endpoints for dynamic interactive quick quizzes and practice sessions")
public class PracticeController {

    private final PracticeService practiceService;

    @GetMapping("/quick-quiz")
    @Operation(summary = "Generate a dynamic quick quiz for interactive practice")
    public ResponseEntity<PracticeQuizResponse> getQuickQuiz(
            @RequestParam(required = false) UUID levelId,
            @RequestParam(required = false) UUID moduleId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(practiceService.generateQuickQuiz(levelId, moduleId, limit));
    }
}
