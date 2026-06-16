package com.kuraflow.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.kuraflow.shared.event.BadgeEarnedEvent;
import com.kuraflow.shared.event.StreakUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserGamificationEventListener {

    private final PushNotificationService pushNotificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "badge.earned", groupId = "user-service-group")
    public void handleBadgeEarned(BadgeEarnedEvent event) {
        log.info("Received badge.earned event for user: {}", event.getUserId());
        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("type", "badge");
            payload.put("title", "New Badge Unlocked! 🏆");
            payload.put("body", "You earned the " + event.getBadgeName() + " badge.");
            if (event.getIconUrl() != null) {
                payload.put("icon", event.getIconUrl());
            }
            
            pushNotificationService.sendNotification(event.getUserId(), payload.toString());
        } catch (Exception e) {
            log.error("Failed to process badge.earned event", e);
        }
    }

    @KafkaListener(topics = "streak.updated", groupId = "user-service-group")
    public void handleStreakUpdated(StreakUpdatedEvent event) {
        log.info("Received streak.updated event for user: {}", event.getUserId());
        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("type", "streak");
            payload.put("title", "Streak Kept Alive! 🔥");
            payload.put("body", "Your current streak is now " + event.getCurrentStreak() + " days.");
            if (event.isNewRecord()) {
                payload.put("body", payload.get("body").asText() + " That's a new record!");
            }
            
            pushNotificationService.sendNotification(event.getUserId(), payload.toString());
        } catch (Exception e) {
            log.error("Failed to process streak.updated event", e);
        }
    }
}
