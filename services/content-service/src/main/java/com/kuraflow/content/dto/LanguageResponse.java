package com.kuraflow.content.dto;

import java.util.UUID;

public record LanguageResponse(
    UUID id,
    String code,
    String name,
    String framework,
    Boolean isActive
) {}
