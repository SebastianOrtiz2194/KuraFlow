package com.kuraflow.content.dto;

import java.util.Map;
import java.util.UUID;

public record FlashcardResponse(
    UUID id,
    UUID deckId,
    Map<String, Object> front,
    Map<String, Object> back,
    String[] tags,
    Integer sortOrder
) {}
