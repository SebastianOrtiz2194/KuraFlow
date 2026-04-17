package com.kuraflow.content.dto;

import java.util.List;
import java.util.UUID;

public record LessonDetailResponse(
    UUID id,
    UUID moduleId,
    String title,
    String description,
    Integer estimatedMinutes,
    Integer xpReward,
    List<LessonContentResponse> contents
) {}
