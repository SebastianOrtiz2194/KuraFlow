package com.kuraflow.content.dto;

import java.util.UUID;

public record FlashcardDeckResponse(
    UUID id,
    UUID moduleId,
    String title,
    String description,
    Integer cardCount
) {}
