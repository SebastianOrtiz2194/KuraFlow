package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBadgeDto {
    private UUID badgeId;
    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private String category;
    private Integer xpReward;
    private OffsetDateTime earnedAt;
}
