package com.kuraflow.gamification.consumer;

import com.kuraflow.gamification.service.ActivityHistoryService;
import com.kuraflow.gamification.service.StreakService;
import com.kuraflow.shared.events.LessonCompletedEvent;
import com.kuraflow.shared.events.ReviewCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaEventConsumer {

    private final StreakService streakService;
    private final ActivityHistoryService activityHistoryService;

    @RetryableTopic(
            attempts = "4",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
            dltStrategy = org.springframework.kafka.retrytopic.DltStrategy.FAIL_ON_ERROR
    )
    @KafkaListener(topics = "${app.kafka.topics.lesson-completed}", groupId = "gamification-group")
    public void handleLessonCompleted(LessonCompletedEvent event) {
        log.info("Received lesson completed event: user={}, lesson={}, score={}", 
                event.getUserId(), event.getLessonId(), event.getScore());
        
        // Update XP: Base 10 XP + extra based on score (simplified for now)
        int xpEarned = 10 + (int) (event.getScore() / 10);
        streakService.processActivity(event.getUserId(), event.getTimestamp(), xpEarned, true, event.getScore());
        activityHistoryService.recordActivity(event.getUserId(), "LESSON_COMPLETED",
                "Completed lesson", xpEarned, event.getTimestamp() != null ? event.getTimestamp() : Instant.now());
    }

    @RetryableTopic(
            attempts = "4",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
            dltStrategy = org.springframework.kafka.retrytopic.DltStrategy.FAIL_ON_ERROR
    )
    @KafkaListener(topics = "${app.kafka.topics.review-completed}", groupId = "gamification-group")
    public void handleReviewCompleted(ReviewCompletedEvent event) {
        log.info("Received review completed event: user={}, card={}, quality={}", 
                event.getUserId(), event.getCardId(), event.getQuality());
        
        // Update XP: 5 XP for a review
        int xpEarned = 5;
        streakService.processActivity(event.getUserId(), event.getTimestamp(), xpEarned, false, 0.0);
        activityHistoryService.recordActivity(event.getUserId(), "REVIEW_COMPLETED",
                "Completed SRS review", xpEarned, event.getTimestamp() != null ? event.getTimestamp() : Instant.now());
    }
}
