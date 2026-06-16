package com.kuraflow.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeEarnedEvent {
    private UUID userId;
    private String badgeCode;
    private String badgeName;
    private String iconUrl;
    private long timestamp;
}
