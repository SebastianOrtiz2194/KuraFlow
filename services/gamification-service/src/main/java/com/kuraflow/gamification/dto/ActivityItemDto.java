package com.kuraflow.gamification.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record ActivityItemDto(
        String type,
        String description,
        int xpEarned,
        Instant timestamp
) {}
