package com.kuraflow.content.controller;

import com.kuraflow.content.dto.ModuleResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.service.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/content/modules")
@RequiredArgsConstructor
@Tag(name = "Module API", description = "Endpoints for retrieving learning modules")
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    @Operation(summary = "Get modules by level (paginated)")
    public ResponseEntity<PagedResponse<ModuleResponse>> getModulesByLevel(
            @RequestParam UUID levelId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(moduleService.getModulesByLevel(levelId, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get module by ID")
    public ResponseEntity<ModuleResponse> getModuleById(@PathVariable UUID id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }
}
