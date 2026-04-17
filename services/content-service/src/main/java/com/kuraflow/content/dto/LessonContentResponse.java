package com.kuraflow.content.dto;

import java.util.Map;
import java.util.UUID;

public record LessonContentResponse(
    UUID id,
    String contentType,
    Integer sortOrder,
    String title,
    Map<String, Object> body
) {}
