package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.ClaimQuestResponse;
import com.kuraflow.gamification.dto.DailyQuestDto;
import com.kuraflow.gamification.entity.DailyQuest;
import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.DailyQuestRepository;
import com.kuraflow.gamification.repository.UserStreakRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyQuestServiceTest {

    @Mock
    private DailyQuestRepository dailyQuestRepository;

    @Mock
    private UserStreakRepository userStreakRepository;

    @Mock
    private LeaderboardService leaderboardService;

    @InjectMocks
    private DailyQuestService dailyQuestService;

    @Test
    @DisplayName("getDailyQuests: Generates quests if none exist for today")
    void getDailyQuests_GeneratesIfMissing() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(ZoneId.of("UTC"));

        when(dailyQuestRepository.findByUserIdAndQuestDate(userId, today)).thenReturn(List.of());
        when(dailyQuestRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        List<DailyQuestDto> quests = dailyQuestService.getDailyQuests(userId);

        assertThat(quests).isNotEmpty();
        assertThat(quests).hasSize(4);
    }

    @Test
    @DisplayName("recordProgress: Increments quest progress and marks completed when target reached")
    void recordProgress_CompletesQuest() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now(ZoneId.of("UTC"));

        DailyQuest quest = DailyQuest.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .questDate(today)
                .questType("LESSON_COUNT")
                .title("Complete 2 Lessons")
                .targetCount(2)
                .currentCount(1)
                .xpReward(30)
                .isCompleted(false)
                .isClaimed(false)
                .build();

        when(dailyQuestRepository.findByUserIdAndQuestDate(userId, today)).thenReturn(List.of(quest));

        dailyQuestService.recordProgress(userId, "LESSON_COUNT", 1);

        assertThat(quest.getCurrentCount()).isEqualTo(2);
        assertThat(quest.getIsCompleted()).isTrue();
        verify(dailyQuestRepository).save(quest);
    }

    @Test
    @DisplayName("claimQuest: Claims completed quest, awards XP, and syncs leaderboard")
    void claimQuest_Success() {
        UUID userId = UUID.randomUUID();
        UUID questId = UUID.randomUUID();

        DailyQuest quest = DailyQuest.builder()
                .id(questId)
                .userId(userId)
                .questDate(LocalDate.now(ZoneId.of("UTC")))
                .questType("XP_EARNED")
                .title("Earn 40 XP")
                .targetCount(40)
                .currentCount(40)
                .xpReward(40)
                .isCompleted(true)
                .isClaimed(false)
                .build();

        UserStreak streak = UserStreak.builder()
                .userId(userId)
                .totalXp(100)
                .build();

        when(dailyQuestRepository.findByUserIdAndId(userId, questId)).thenReturn(Optional.of(quest));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));

        ClaimQuestResponse response = dailyQuestService.claimQuest(userId, questId);

        assertThat(response).isNotNull();
        assertThat(response.getXpClaimed()).isEqualTo(40);
        assertThat(response.getTotalXp()).isEqualTo(140);
        assertThat(quest.getIsClaimed()).isTrue();

        verify(dailyQuestRepository).save(quest);
        verify(userStreakRepository).save(streak);
        verify(leaderboardService).addXp(userId, 40);
    }

    @Test
    @DisplayName("claimQuest: Throws exception when quest is not completed or already claimed")
    void claimQuest_UncompletedThrows() {
        UUID userId = UUID.randomUUID();
        UUID questId = UUID.randomUUID();

        DailyQuest quest = DailyQuest.builder()
                .id(questId)
                .userId(userId)
                .isCompleted(false)
                .isClaimed(false)
                .build();

        when(dailyQuestRepository.findByUserIdAndId(userId, questId)).thenReturn(Optional.of(quest));

        assertThatThrownBy(() -> dailyQuestService.claimQuest(userId, questId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not yet completed");
    }
}
