package com.kuraflow.content.service;

import com.kuraflow.content.dto.LanguageResponse;
import com.kuraflow.content.entity.Language;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LanguageService {

    private final LanguageRepository languageRepository;

    @Cacheable(value = "languages")
    public List<LanguageResponse> getAllLanguages() {
        return languageRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Cacheable(value = "language", key = "#id")
    public LanguageResponse getLanguageById(UUID id) {
        Language language = languageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Language", "id", id));
        return mapToResponse(language);
    }

    private LanguageResponse mapToResponse(Language language) {
        return new LanguageResponse(
                language.getId(),
                language.getCode(),
                language.getName(),
                language.getFramework(),
                language.getIsActive()
        );
    }
}
