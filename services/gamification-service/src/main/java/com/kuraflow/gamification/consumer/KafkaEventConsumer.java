package com.kuraflow.gamification.consumer;

import com.kuraflow.shared.events.LessonCompletedEvent;
import com.kuraflow.shared.events.ReviewCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaEventConsumer {

    private final com.kuraflow.gamification.repository.UserStreakRepository userStreakRepository;

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
        
        com.kuraflow.gamification.entity.UserStreak streak = userStreakRepository.findByUserId(event.getUserId())
                .orElse(com.kuraflow.gamification.entity.UserStreak.builder()
                        .userId(event.getUserId())
                        .build());

        // Update XP: Base 10 XP + extra based on score (simplified for now)
        int xpEarned = 10 + (int) (event.getScore() / 10);
        streak.setTotalXp(streak.getTotalXp() + xpEarned);

        // Update Streak
        java.time.LocalDate today = java.time.LocalDate.now();
        if (streak.getLastActivity() == null) {
            streak.setCurrentStreak(1);
            streak.setLongest_streak(1);
        } else if (streak.getLastActivity().equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongest_streak()) {
                streak.setLongest_streak(streak.getCurrentStreak());
            }
        } else if (!streak.getLastActivity().equals(today)) {
            streak.setCurrentStreak(1);
        }
        
        streak.setLastActivity(today);
        userStreakRepository.save(streak);
        
        log.info("Updated streak for user {}: current={}, xp={}", event.getUserId(), streak.getCurrentStreak(), streak.getTotalXp());
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
        
        com.kuraflow.gamification.entity.UserStreak streak = userStreakRepository.findByUserId(event.getUserId())
                .orElse(com.kuraflow.gamification.entity.UserStreak.builder()
                        .userId(event.getUserId())
                        .build());

        // Update XP: 5 XP for a review
        streak.setTotalXp(streak.getTotalXp() + 5);
        
        // Update activity date but don't reset streak if it was already updated today
        java.time.LocalDate today = java.time.LocalDate.now();
        if (streak.getLastActivity() == null || streak.getLastActivity().isBefore(today)) {
             // Re-use logic from lesson completed if needed, or keep it simple
             if (streak.getLastActivity() != null && streak.getLastActivity().equals(today.minusDays(1))) {
                 streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                 if (streak.getCurrentStreak() > streak.getLongest_streak()) {
                     streak.setLongest_streak(streak.getCurrentStreak());
                 }
             } else if (streak.getLastActivity() == null || !streak.getLastActivity().equals(today)) {
                 streak.setCurrentStreak(1);
             }
             streak.setLastActivity(today);
        }
        
        userStreakRepository.save(streak);
        log.info("Updated streak (review) for user {}: current={}, xp={}", event.getUserId(), streak.getCurrentStreak(), streak.getTotalXp());
    }
}
