package com.kuraflow.content.service;

import com.kuraflow.content.dto.LessonDetailResponse;
import com.kuraflow.content.dto.LessonResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.LessonContent;
import com.kuraflow.content.entity.Module;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.LessonContentRepository;
import com.kuraflow.content.repository.LessonRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonContentRepository lessonContentRepository;

    @InjectMocks
    private LessonService lessonService;

    @Test
    @DisplayName("getLessonsByModule: Returns paginated lessons list")
    void getLessonsByModule_Success() {
        UUID moduleId = UUID.randomUUID();
        Module module = Module.builder().id(moduleId).title("Grammar Basics").build();
        Lesson lesson = Lesson.builder()
                .id(UUID.randomUUID())
                .module(module)
                .title("Present Simple")
                .description("Intro lesson")
                .sortOrder(1)
                .estimatedMinutes(10)
                .xpReward(15)
                .build();

        when(lessonRepository.findByModuleId(eq(moduleId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(lesson)));

        PagedResponse<LessonResponse> response = lessonService.getLessonsByModule(moduleId, 0, 10);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).title()).isEqualTo("Present Simple");
    }

    @Test
    @DisplayName("getLessonDetail: Returns lesson with content items")
    void getLessonDetail_Success() {
        UUID lessonId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        Module module = Module.builder().id(moduleId).build();
        Lesson lesson = Lesson.builder()
                .id(lessonId)
                .module(module)
                .title("Lesson 1")
                .description("Desc")
                .estimatedMinutes(5)
                .xpReward(10)
                .build();

        LessonContent content = LessonContent.builder()
                .id(UUID.randomUUID())
                .lesson(lesson)
                .contentType("EXPLANATION")
                .sortOrder(1)
                .title("Grammar rule")
                .body(Map.of("html", "<p>Hello</p>"))
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(lessonContentRepository.findByLessonIdOrderBySortOrderAsc(lessonId)).thenReturn(List.of(content));

        LessonDetailResponse response = lessonService.getLessonDetail(lessonId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(lessonId);
        assertThat(response.contents()).hasSize(1);
        assertThat(response.contents().get(0).contentType()).isEqualTo("EXPLANATION");
    }

    @Test
    @DisplayName("getLessonDetail: Throws ResourceNotFoundException when not found")
    void getLessonDetail_NotFound() {
        UUID lessonId = UUID.randomUUID();
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonService.getLessonDetail(lessonId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
