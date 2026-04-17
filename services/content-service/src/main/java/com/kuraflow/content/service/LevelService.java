package com.kuraflow.content.service;

import com.kuraflow.content.dto.LevelResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.entity.Level;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.LevelRepository;
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
public class LevelService {

    private final LevelRepository levelRepository;

    @Cacheable(value = "levels", key = "{#languageId, #pageNo, #pageSize}")
    public PagedResponse<LevelResponse> getLevelsByLanguage(UUID languageId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("sortOrder").ascending());
        Page<Level> levelsPage = levelRepository.findByLanguageId(languageId, pageable);

        return new PagedResponse<>(
                levelsPage.getContent().stream().map(this::mapToResponse).toList(),
                levelsPage.getNumber(),
                levelsPage.getSize(),
                levelsPage.getTotalElements(),
                levelsPage.getTotalPages(),
                levelsPage.isLast()
        );
    }

    @Cacheable(value = "level", key = "#id")
    public LevelResponse getLevelById(UUID id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Level", "id", id));
        return mapToResponse(level);
    }

    private LevelResponse mapToResponse(Level level) {
        return new LevelResponse(
                level.getId(),
                level.getLanguage().getId(),
                level.getCode(),
                level.getName(),
                level.getDescription(),
                level.getSortOrder(),
                level.getTotalXpRequired()
        );
    }
}
