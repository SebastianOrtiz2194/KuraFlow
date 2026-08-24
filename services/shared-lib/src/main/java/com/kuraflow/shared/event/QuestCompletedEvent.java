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
public class QuestCompletedEvent {
    private UUID userId;
    private UUID questId;
    private String questType;
    private String questTitle;
    private int xpReward;
    private Instant timestamp;
}
