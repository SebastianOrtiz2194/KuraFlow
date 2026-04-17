package com.kuraflow.content.service;

import com.kuraflow.content.dto.*;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.LessonContent;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.LessonContentRepository;
import com.kuraflow.content.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonContentRepository lessonContentRepository;

    @Cacheable(value = "lessons", key = "{#moduleId, #pageNo, #pageSize}")
    public PagedResponse<LessonResponse> getLessonsByModule(UUID moduleId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("sortOrder").ascending());
        Page<Lesson> lessonPage = lessonRepository.findByModuleId(moduleId, pageable);

        return new PagedResponse<>(
                lessonPage.getContent().stream().map(this::mapToResponse).toList(),
                lessonPage.getNumber(),
                lessonPage.getSize(),
                lessonPage.getTotalElements(),
                lessonPage.getTotalPages(),
                lessonPage.isLast()
        );
    }

    @Cacheable(value = "lesson-detail", key = "#id")
    public LessonDetailResponse getLessonDetail(UUID id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        
        List<LessonContent> contents = lessonContentRepository.findByLessonIdOrderBySortOrderAsc(id);
        
        return new LessonDetailResponse(
                lesson.getId(),
                lesson.getModule().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getEstimatedMinutes(),
                lesson.getXpReward(),
                contents.stream().map(this::mapToContentResponse).toList()
        );
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getModule().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getSortOrder(),
                lesson.getEstimatedMinutes(),
                lesson.getXpReward()
        );
    }

    private LessonContentResponse mapToContentResponse(LessonContent content) {
        return new LessonContentResponse(
                content.getId(),
                content.getContentType(),
                content.getSortOrder(),
                content.getTitle(),
                content.getBody()
        );
    }
}
