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
public class PracticeQuestionDto {
    private UUID id;
    private String type; // MULTIPLE_CHOICE, FLASHCARD_PROMPT, TRANSLATION
    private String prompt;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private UUID sourceId;
    private int xpReward;
}
