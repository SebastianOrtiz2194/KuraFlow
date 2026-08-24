package com.kuraflow.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuraflow.shared.event.BadgeEarnedEvent;
import com.kuraflow.shared.event.StreakUpdatedEvent;
import com.kuraflow.shared.event.UserRegisteredEvent;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserGamificationEventListenerTest {

    @Mock
    private PushNotificationService pushNotificationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserGamificationEventListener listener;

    @Test
    @DisplayName("handleUserRegistered: Successfully provisions new user entity")
    void handleUserRegistered_CreatesUser() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(userId)
                .email("newuser@kuraflow.com")
                .displayName("New User")
                .authProvider("local")
                .timestamp(Instant.now())
                .build();

        when(userRepository.existsById(userId)).thenReturn(false);

        listener.handleUserRegistered(event);

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("handleBadgeEarned: Sends push notification")
    void handleBadgeEarned_SendsNotification() {
        UUID userId = UUID.randomUUID();
        BadgeEarnedEvent event = BadgeEarnedEvent.builder()
                .userId(userId)
                .badgeCode("STREAK_7")
                .badgeName("Week One")
                .iconUrl("http://badge.svg")
                .timestamp(System.currentTimeMillis())
                .build();

        listener.handleBadgeEarned(event);

        verify(pushNotificationService).sendNotification(eq(userId), anyString());
    }

    @Test
    @DisplayName("handleStreakUpdated: Sends push notification")
    void handleStreakUpdated_SendsNotification() {
        UUID userId = UUID.randomUUID();
        StreakUpdatedEvent event = StreakUpdatedEvent.builder()
                .userId(userId)
                .currentStreak(7)
                .isNewRecord(true)
                .timestamp(System.currentTimeMillis())
                .build();

        listener.handleStreakUpdated(event);

        verify(pushNotificationService).sendNotification(eq(userId), anyString());
    }
}
