package com.kuraflow.gamification.service;

import com.kuraflow.gamification.entity.Badge;
import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.BadgeRepository;
import com.kuraflow.gamification.repository.UserBadgeRepository;
import com.kuraflow.gamification.repository.UserStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private UserStreakRepository userStreakRepository;

    @Mock
    private LeaderboardService leaderboardService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private BadgeService badgeService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(badgeService, "badgeEarnedTopic", "badge.earned");
    }

    @Test
    @DisplayName("evaluateBadges: Awards badge when user meets streak criteria and emits event")
    void evaluateBadges_StreakBadgeAwarded() {
        UUID userId = UUID.randomUUID();
        UUID badgeId = UUID.randomUUID();

        Badge badge = Badge.builder()
                .id(badgeId)
                .code("STREAK_7")
                .name("Week One")
                .xpReward(100)
                .criteria(Map.of("type", "streak", "threshold", 7))
                .build();

        UserStreak streak = UserStreak.builder()
                .userId(userId)
                .currentStreak(7)
                .totalXp(200)
                .build();

        when(badgeRepository.findAll()).thenReturn(List.of(badge));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)).thenReturn(false);

        badgeService.evaluateBadges(userId, "ACTIVITY", Map.of());

        verify(userBadgeRepository).save(any());
        verify(userStreakRepository).save(argThat(s -> s.getTotalXp() == 300));
        verify(leaderboardService).syncTotalXp(userId, 300);
        verify(kafkaTemplate).send(eq("badge.earned"), eq(userId.toString()), any());
    }

    @Test
    @DisplayName("evaluateBadges: Skips badge if already owned")
    void evaluateBadges_SkipsAlreadyOwned() {
        UUID userId = UUID.randomUUID();
        UUID badgeId = UUID.randomUUID();

        Badge badge = Badge.builder()
                .id(badgeId)
                .code("STREAK_3")
                .criteria(Map.of("type", "streak", "threshold", 3))
                .build();

        UserStreak streak = UserStreak.builder()
                .userId(userId)
                .currentStreak(5)
                .build();

        when(badgeRepository.findAll()).thenReturn(List.of(badge));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)).thenReturn(true);

        badgeService.evaluateBadges(userId, "ACTIVITY", Map.of());

        verify(userBadgeRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }
}
