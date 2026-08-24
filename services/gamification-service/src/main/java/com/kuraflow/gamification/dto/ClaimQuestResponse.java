package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimQuestResponse {
    private UUID questId;
    private int xpClaimed;
    private int totalXp;
    private String message;
}
