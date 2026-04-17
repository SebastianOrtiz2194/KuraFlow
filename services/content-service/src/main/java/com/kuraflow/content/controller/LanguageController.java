package com.kuraflow.content.controller;

import com.kuraflow.content.dto.LanguageResponse;
import com.kuraflow.content.service.LanguageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/content/languages")
@RequiredArgsConstructor
@Tag(name = "Language API", description = "Endpoints for retrieving system languages")
public class LanguageController {

    private final LanguageService languageService;

    @GetMapping
    @Operation(summary = "Get all available languages")
    public ResponseEntity<List<LanguageResponse>> getAllLanguages() {
        return ResponseEntity.ok(languageService.getAllLanguages());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get language by ID")
    public ResponseEntity<LanguageResponse> getLanguageById(@PathVariable UUID id) {
        return ResponseEntity.ok(languageService.getLanguageById(id));
    }
}
