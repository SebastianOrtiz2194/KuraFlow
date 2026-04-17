package com.kuraflow.content.controller;

import com.kuraflow.content.dto.LevelResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.service.LevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/content/levels")
@RequiredArgsConstructor
@Tag(name = "Level API", description = "Endpoints for retrieving language levels")
public class LevelController {

    private final LevelService levelService;

    @GetMapping
    @Operation(summary = "Get levels by language (paginated)")
    public ResponseEntity<PagedResponse<LevelResponse>> getLevelsByLanguage(
            @RequestParam UUID languageId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(levelService.getLevelsByLanguage(languageId, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get level by ID")
    public ResponseEntity<LevelResponse> getLevelById(@PathVariable UUID id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }
}
