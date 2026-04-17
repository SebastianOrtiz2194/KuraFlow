package com.kuraflow.content.dto;

import java.util.UUID;

public record LevelResponse(
    UUID id,
    UUID languageId,
    String code,
    String name,
    String description,
    Integer sortOrder,
    Integer totalXpRequired
) {}
