package com.kuraflow.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String displayName;

    private String avatarUrl;
    private UUID preferredLanguageId;
    private UUID currentLevelId;
    private String timezone;
}
