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
public class StreakReminderEvent {
    private UUID userId;
    private int currentStreak;
    private Instant timestamp;
}
