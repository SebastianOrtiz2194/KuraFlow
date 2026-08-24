package com.kuraflow.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.kuraflow.shared.event.BadgeEarnedEvent;
import com.kuraflow.shared.event.StreakReminderEvent;
import com.kuraflow.shared.event.StreakUpdatedEvent;
import com.kuraflow.shared.event.UserRegisteredEvent;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserGamificationEventListener {

    private final PushNotificationService pushNotificationService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @KafkaListener(topics = "user.registered", groupId = "user-service-group")
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received user.registered event for user: {} ({})", event.getUserId(), event.getEmail());
        try {
            if (!userRepository.existsById(event.getUserId())) {
                User user = User.builder()
                        .id(event.getUserId())
                        .email(event.getEmail())
                        .displayName(event.getDisplayName() != null ? event.getDisplayName() : event.getEmail().split("@")[0])
                        .authProvider(event.getAuthProvider() != null ? event.getAuthProvider() : "local")
                        .timezone("UTC")
                        .isPremium(false)
                        .createdAt(OffsetDateTime.now())
                        .updatedAt(OffsetDateTime.now())
                        .build();
                userRepository.save(user);
                log.info("Successfully provisioned User entity for user: {}", event.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to process user.registered event for user: {}", event.getUserId(), e);
        }
    }

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

    @KafkaListener(topics = "streak.reminder", groupId = "user-service-group")
    public void handleStreakReminder(StreakReminderEvent event) {
        log.info("Received streak.reminder event for user: {}", event.getUserId());
        try {
            // Send Web Push Notification
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("type", "reminder");
            payload.put("title", "Don't lose your streak! ⏳");
            payload.put("body", "You're on a " + event.getCurrentStreak() + "-day streak. Complete a lesson today to keep it going!");
            
            pushNotificationService.sendNotification(event.getUserId(), payload.toString());

            // Send Email
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user != null && user.getEmail() != null) {
                emailService.sendStreakReminderEmail(user.getEmail(), user.getDisplayName(), event.getCurrentStreak());
            }

        } catch (Exception e) {
            log.error("Failed to process streak.reminder event", e);
        }
    }
}
