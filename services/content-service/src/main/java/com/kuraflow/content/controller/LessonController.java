package com.kuraflow.content.controller;

import com.kuraflow.content.dto.LessonDetailResponse;
import com.kuraflow.content.dto.LessonResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/content/lessons")
@RequiredArgsConstructor
@Tag(name = "Lesson API", description = "Endpoints for retrieving lesson content")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    @Operation(summary = "Get lessons by module (paginated summary)")
    public ResponseEntity<PagedResponse<LessonResponse>> getLessonsByModule(
            @RequestParam UUID moduleId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(lessonService.getLessonsByModule(moduleId, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full lesson details with content items")
    public ResponseEntity<LessonDetailResponse> getLessonDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonService.getLessonDetail(id));
    }
}
