package com.kuraflow.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private String type;
    private List<LeaderboardEntryDto> entries;
    private LeaderboardEntryDto currentUser;
    private Long totalParticipants;
}
