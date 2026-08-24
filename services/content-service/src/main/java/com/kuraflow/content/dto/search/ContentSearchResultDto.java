package com.kuraflow.content.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentSearchResultDto {
    private UUID id;
    private String type; // "LESSON", "MODULE", "FLASHCARD"
    private String title;
    private String description;
    private UUID parentId;
    private String extraInfo;
}
