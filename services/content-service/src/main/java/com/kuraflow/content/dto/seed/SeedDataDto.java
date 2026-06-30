package com.kuraflow.content.dto.seed;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SeedDataDto {
    private String languageCode;
    private String levelCode;
    private List<ModuleDto> modules;

    @Data
    public static class ModuleDto {
        private String type;
        private String title;
        private String description;
        private Integer sortOrder;
        private String iconUrl;
        private List<LessonDto> lessons;
        private List<FlashcardDeckDto> flashcardDecks;
    }

    @Data
    public static class LessonDto {
        private String title;
        private String description;
        private Integer sortOrder;
        private Integer estimatedMinutes;
        private Integer xpReward;
        private List<LessonContentDto> content;
    }

    @Data
    public static class LessonContentDto {
        private String contentType;
        private Integer sortOrder;
        private String title;
        private Map<String, Object> body;
    }

    @Data
    public static class FlashcardDeckDto {
        private String title;
        private String description;
        private List<FlashcardDto> flashcards;
    }

    @Data
    public static class FlashcardDto {
        private Map<String, Object> front;
        private Map<String, Object> back;
        private List<String> tags;
        private Integer sortOrder;
    }
}
