package com.kuraflow.content.service;

import com.kuraflow.content.dto.FlashcardResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.entity.Flashcard;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.FlashcardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;

    @Cacheable(value = "flashcards", key = "{#deckId, #pageNo, #pageSize}")
    public PagedResponse<FlashcardResponse> getFlashcardsByDeck(UUID deckId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("sortOrder").ascending());
        Page<Flashcard> flashcardPage = flashcardRepository.findByDeckId(deckId, pageable);

        return new PagedResponse<>(
                flashcardPage.getContent().stream().map(this::mapToResponse).toList(),
                flashcardPage.getNumber(),
                flashcardPage.getSize(),
                flashcardPage.getTotalElements(),
                flashcardPage.getTotalPages(),
                flashcardPage.isLast()
        );
    }

    @Cacheable(value = "flashcards-by-tag", key = "{#tag, #pageNo, #pageSize}")
    public PagedResponse<FlashcardResponse> getFlashcardsByTag(String tag, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("id").ascending());
        Page<Flashcard> flashcardPage = flashcardRepository.findByTag(tag, pageable);

        return new PagedResponse<>(
                flashcardPage.getContent().stream().map(this::mapToResponse).toList(),
                flashcardPage.getNumber(),
                flashcardPage.getSize(),
                flashcardPage.getTotalElements(),
                flashcardPage.getTotalPages(),
                flashcardPage.isLast()
        );
    }

    @Cacheable(value = "flashcard", key = "#id")
    public FlashcardResponse getFlashcardById(UUID id) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard", "id", id));
        return mapToResponse(flashcard);
    }

    private FlashcardResponse mapToResponse(Flashcard flashcard) {
        return new FlashcardResponse(
                flashcard.getId(),
                flashcard.getDeck().getId(),
                flashcard.getFront(),
                flashcard.getBack(),
                flashcard.getTags(),
                flashcard.getSortOrder()
        );
    }
}
