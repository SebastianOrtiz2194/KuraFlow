package com.kuraflow.progress.service;

import com.kuraflow.shared.events.LessonCompletedEvent;
import com.kuraflow.shared.events.ReviewCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.lesson-completed}")
    private String lessonCompletedTopic;

    @Value("${app.kafka.topics.review-completed}")
    private String reviewCompletedTopic;

    public void publishLessonCompleted(LessonCompletedEvent event) {
        log.info("Publishing lesson completed event for user {} and lesson {}", event.getUserId(), event.getLessonId());
        kafkaTemplate.send(lessonCompletedTopic, event.getUserId().toString(), event);
    }

    public void publishReviewCompleted(ReviewCompletedEvent event) {
        log.info("Publishing review completed event for user {} and card {}", event.getUserId(), event.getCardId());
        kafkaTemplate.send(reviewCompletedTopic, event.getUserId().toString(), event);
    }
}
