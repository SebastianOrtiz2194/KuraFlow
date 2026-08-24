package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.UserStreakDto;
import com.kuraflow.gamification.entity.UserStreak;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

    @Mock
    private UserStreakRepository userStreakRepository;

    @Mock
    private BadgeService badgeService;

    @Mock
    private LeaderboardService leaderboardService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private StreakService streakService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(streakService, "streakUpdatedTopic", "streak.updated");
    }

    @Test
    @DisplayName("processActivity: First time activity starts 1-day streak and emits event")
    void processActivity_FirstTimeStartsStreak() {
        UUID userId = UUID.randomUUID();
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userStreakRepository.save(any(UserStreak.class))).thenAnswer(i -> i.getArgument(0));

        streakService.processActivity(userId, Instant.now(), 20, true, 100.0);

        verify(userStreakRepository).save(argThat(s ->
                s.getCurrentStreak() == 1 &&
                s.getLongestStreak() == 1 &&
                s.getTotalXp() == 20 &&
                s.getTotalLessonsCompleted() == 1 &&
                s.getTotalPerfectScores() == 1
        ));

        verify(leaderboardService).addXp(userId, 20);
        verify(badgeService).evaluateBadges(eq(userId), eq("LESSON_COMPLETED"), any());
        verify(kafkaTemplate).send(eq("streak.updated"), eq(userId.toString()), any());
    }

    @Test
    @DisplayName("processActivity: Consecutive day activity increments streak")
    void processActivity_ConsecutiveDayIncrementsStreak() {
        UUID userId = UUID.randomUUID();
        UserStreak existing = UserStreak.builder()
                .userId(userId)
                .currentStreak(3)
                .longestStreak(3)
                .totalXp(100)
                .lastActivity(LocalDate.now().minusDays(1))
                .build();

        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(userStreakRepository.save(any(UserStreak.class))).thenAnswer(i -> i.getArgument(0));

        streakService.processActivity(userId, Instant.now(), 15, false, 0.0);

        verify(userStreakRepository).save(argThat(s ->
                s.getCurrentStreak() == 4 &&
                s.getLongestStreak() == 4
        ));
    }

    @Test
    @DisplayName("purchaseFreeze: Deducts 100 XP and grants 1 freeze")
    void purchaseFreeze_Success() {
        UUID userId = UUID.randomUUID();
        UserStreak existing = UserStreak.builder()
                .userId(userId)
                .totalXp(250)
                .streakFreezes(0)
                .build();

        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(existing));

        streakService.purchaseFreeze(userId);

        assertThat(existing.getTotalXp()).isEqualTo(150);
        assertThat(existing.getStreakFreezes()).isEqualTo(1);
        verify(userStreakRepository).save(existing);
    }

    @Test
    @DisplayName("purchaseFreeze: Throws IllegalStateException when XP is insufficient")
    void purchaseFreeze_InsufficientXp() {
        UUID userId = UUID.randomUUID();
        UserStreak existing = UserStreak.builder()
                .userId(userId)
                .totalXp(50)
                .streakFreezes(0)
                .build();

        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> streakService.purchaseFreeze(userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough XP");
    }
}
