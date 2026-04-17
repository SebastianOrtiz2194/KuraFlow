package com.kuraflow.content.dto;

import java.util.UUID;

public record ModuleResponse(
    UUID id,
    UUID levelId,
    String type,
    String title,
    String description,
    Integer sortOrder,
    String iconUrl
) {}
