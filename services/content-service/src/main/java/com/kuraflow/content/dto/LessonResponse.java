package com.kuraflow.content.dto;

import java.util.UUID;

public record LessonResponse(
    UUID id,
    UUID moduleId,
    String title,
    String description,
    Integer sortOrder,
    Integer estimatedMinutes,
    Integer xpReward
) {}
