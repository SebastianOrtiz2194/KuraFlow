package com.kuraflow.progress.service.impl;

import com.kuraflow.progress.dto.SaveProgressRequest;
import com.kuraflow.progress.entity.UserProgress;
import com.kuraflow.progress.service.KafkaEventPublisher;
import com.kuraflow.progress.service.ProgressService;
import com.kuraflow.shared.events.LessonCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final UserProgressRepository userProgressRepository;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Override
    @Transactional
    public UserProgress saveLessonProgress(UUID userId, UUID lessonId, SaveProgressRequest request) {
        UserProgress progress = userProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElse(UserProgress.builder()
                        .userId(userId)
                        .lessonId(lessonId)
                        .startedAt(OffsetDateTime.now())
                        .build());

        // Update stats
        progress.setScore(request.getScore());
        progress.setXpEarned(progress.getXpEarned() + request.getXpEarned());
        progress.setAttempts(progress.getAttempts() + 1);
        progress.setStatus("COMPLETED");
        progress.setCompletedAt(OffsetDateTime.now());
        progress.setLastAccessed(OffsetDateTime.now());

        UserProgress savedProgress = userProgressRepository.save(progress);

        // Publish event
        kafkaEventPublisher.publishLessonCompleted(LessonCompletedEvent.builder()
                .userId(userId)
                .lessonId(lessonId)
                .score(request.getScore())
                .timestamp(savedProgress.getCompletedAt().toInstant())
                .build());

        return savedProgress;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProgress getLessonProgress(UUID userId, UUID lessonId) {
        return userProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElse(UserProgress.builder()
                        .userId(userId)
                        .lessonId(lessonId)
                        .status("NOT_STARTED")
                        .attempts(0)
                        .xpEarned(0)
                        .build());
    }
}
