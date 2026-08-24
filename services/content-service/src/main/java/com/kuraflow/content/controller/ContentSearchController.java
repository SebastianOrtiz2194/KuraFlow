package com.kuraflow.content.controller;

import com.kuraflow.content.dto.search.ContentSearchResultDto;
import com.kuraflow.content.service.ContentSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/content/search")
@RequiredArgsConstructor
@Tag(name = "Content Search", description = "Global search across lessons, modules, and flashcards")
public class ContentSearchController {

    private final ContentSearchService contentSearchService;

    @GetMapping
    @Operation(summary = "Search content by keyword")
    public ResponseEntity<List<ContentSearchResultDto>> searchContent(@RequestParam String q) {
        return ResponseEntity.ok(contentSearchService.search(q));
    }
}
