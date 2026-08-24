package com.kuraflow.content.dto.practice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeQuizResponse {
    private String title;
    private UUID levelId;
    private UUID moduleId;
    private int totalQuestions;
    private int estimatedMinutes;
    private int totalXpReward;
    private List<PracticeQuestionDto> questions;
}
