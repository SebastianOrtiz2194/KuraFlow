package com.kuraflow.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCompletedEvent {
    private UUID userId;
    private UUID cardId;
    private Integer quality;
    private Instant timestamp;
}
