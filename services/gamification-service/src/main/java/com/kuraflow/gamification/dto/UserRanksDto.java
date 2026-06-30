package com.kuraflow.gamification.dto;

import lombok.Builder;

@Builder
public record UserRanksDto(Integer globalRank, Integer weeklyRank, Long totalXp) {}
