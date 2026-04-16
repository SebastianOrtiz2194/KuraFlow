package com.kuraflow.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String authProvider;
    private UUID preferredLanguageId;
    private UUID currentLevelId;
    private String timezone;
    private Boolean isPremium;
    private OffsetDateTime createdAt;
}
