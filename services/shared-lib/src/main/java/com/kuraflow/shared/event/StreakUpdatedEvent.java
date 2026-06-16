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
public class StreakUpdatedEvent {
    private UUID userId;
    private int currentStreak;
    private boolean isNewRecord;
    private long timestamp;
}
