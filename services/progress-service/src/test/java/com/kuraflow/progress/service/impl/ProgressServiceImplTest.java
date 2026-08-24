package com.kuraflow.progress.service.impl;

import com.kuraflow.progress.dto.SaveProgressRequest;
import com.kuraflow.progress.entity.UserProgress;
import com.kuraflow.progress.repository.UserProgressRepository;
import com.kuraflow.progress.service.KafkaEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceImplTest {

    @Mock
    private UserProgressRepository userProgressRepository;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @InjectMocks
    private ProgressServiceImpl progressService;

    @Test
    @DisplayName("saveLessonProgress: Saves progress, increments attempts and XP, publishes LessonCompletedEvent")
    void saveLessonProgress_Success() {
        UUID userId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();

        SaveProgressRequest request = new SaveProgressRequest();
        request.setScore(BigDecimal.valueOf(95.0));
        request.setXpEarned(20);

        when(userProgressRepository.findByUserIdAndLessonId(userId, lessonId)).thenReturn(Optional.empty());
        when(userProgressRepository.save(any(UserProgress.class))).thenAnswer(i -> i.getArgument(0));

        UserProgress result = progressService.saveLessonProgress(userId, lessonId, request);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getLessonId()).isEqualTo(lessonId);
        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        assertThat(result.getScore()).isEqualTo(BigDecimal.valueOf(95.0));
        assertThat(result.getXpEarned()).isEqualTo(20);
        assertThat(result.getAttempts()).isEqualTo(1);

        verify(kafkaEventPublisher).publishLessonCompleted(any());
    }

    @Test
    @DisplayName("getLessonProgress: Returns NOT_STARTED if no record exists")
    void getLessonProgress_NotStarted() {
        UUID userId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();

        when(userProgressRepository.findByUserIdAndLessonId(userId, lessonId)).thenReturn(Optional.empty());

        UserProgress result = progressService.getLessonProgress(userId, lessonId);

        assertThat(result.getStatus()).isEqualTo("NOT_STARTED");
        assertThat(result.getAttempts()).isEqualTo(0);
    }
}
