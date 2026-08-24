package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.ClaimQuestResponse;
import com.kuraflow.gamification.dto.DailyQuestDto;
import com.kuraflow.gamification.entity.DailyQuest;
import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.DailyQuestRepository;
import com.kuraflow.gamification.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuestService {

    private final DailyQuestRepository dailyQuestRepository;
    private final UserStreakRepository userStreakRepository;
    private final LeaderboardService leaderboardService;

    @Transactional
    public List<DailyQuestDto> getDailyQuests(UUID userId) {
        LocalDate today = LocalDate.now(ZoneId.of("UTC"));
        List<DailyQuest> quests = dailyQuestRepository.findByUserIdAndQuestDate(userId, today);

        if (quests.isEmpty()) {
            quests = generateDailyQuests(userId, today);
        }

        return quests.stream().map(this::toDto).toList();
    }

    @Transactional
    public void recordProgress(UUID userId, String questType, int amount) {
        LocalDate today = LocalDate.now(ZoneId.of("UTC"));
        List<DailyQuest> quests = dailyQuestRepository.findByUserIdAndQuestDate(userId, today);

        if (quests.isEmpty()) {
            quests = generateDailyQuests(userId, today);
        }

        for (DailyQuest quest : quests) {
            if (!quest.getIsCompleted() && quest.getQuestType().equalsIgnoreCase(questType)) {
                int newCount = quest.getCurrentCount() + amount;
                quest.setCurrentCount(newCount);
                if (newCount >= quest.getTargetCount()) {
                    quest.setIsCompleted(true);
                    log.info("User {} completed daily quest: {}", userId, quest.getTitle());
                }
                dailyQuestRepository.save(quest);
            }
        }
    }

    @Transactional
    public ClaimQuestResponse claimQuest(UUID userId, UUID questId) {
        DailyQuest quest = dailyQuestRepository.findByUserIdAndId(userId, questId)
                .orElseThrow(() -> new IllegalArgumentException("Daily quest not found: " + questId));

        if (!quest.getIsCompleted()) {
            throw new IllegalStateException("Quest is not yet completed");
        }

        if (quest.getIsClaimed()) {
            throw new IllegalStateException("Quest reward has already been claimed");
        }

        quest.setIsClaimed(true);
        dailyQuestRepository.save(quest);

        int xpEarned = quest.getXpReward();
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .streakFreezes(0)
                        .totalXp(0)
                        .totalLessonsCompleted(0)
                        .totalPerfectScores(0)
                        .build());

        streak.setTotalXp(streak.getTotalXp() + xpEarned);
        userStreakRepository.save(streak);
        leaderboardService.addXp(userId, xpEarned);

        log.info("User {} claimed {} XP for quest {}", userId, xpEarned, quest.getTitle());

        return ClaimQuestResponse.builder()
                .questId(questId)
                .xpClaimed(xpEarned)
                .totalXp(streak.getTotalXp())
                .message("Successfully claimed " + xpEarned + " bonus XP!")
                .build();
    }

    private List<DailyQuest> generateDailyQuests(UUID userId, LocalDate date) {
        List<DailyQuest> templates = List.of(
                DailyQuest.builder()
                        .userId(userId)
                        .questDate(date)
                        .questType("LESSON_COUNT")
                        .title("Daily Scholar")
                        .description("Complete 2 lessons today")
                        .targetCount(2)
                        .currentCount(0)
                        .xpReward(30)
                        .isCompleted(false)
                        .isClaimed(false)
                        .build(),
                DailyQuest.builder()
                        .userId(userId)
                        .questDate(date)
                        .questType("REVIEW_COUNT")
                        .title("Memory Master")
                        .description("Review 5 SRS flashcards")
                        .targetCount(5)
                        .currentCount(0)
                        .xpReward(20)
                        .isCompleted(false)
                        .isClaimed(false)
                        .build(),
                DailyQuest.builder()
                        .userId(userId)
                        .questDate(date)
                        .questType("XP_EARNED")
                        .title("XP Hunter")
                        .description("Earn 40 XP from activities")
                        .targetCount(40)
                        .currentCount(0)
                        .xpReward(40)
                        .isCompleted(false)
                        .isClaimed(false)
                        .build(),
                DailyQuest.builder()
                        .userId(userId)
                        .questDate(date)
                        .questType("PERFECT_SCORE")
                        .title("Flawless Aim")
                        .description("Score 100% on any quiz")
                        .targetCount(1)
                        .currentCount(0)
                        .xpReward(50)
                        .isCompleted(false)
                        .isClaimed(false)
                        .build()
        );

        return dailyQuestRepository.saveAll(templates);
    }

    private DailyQuestDto toDto(DailyQuest quest) {
        double pct = quest.getTargetCount() > 0 ?
                Math.min(100.0, ((double) quest.getCurrentCount() / quest.getTargetCount()) * 100.0) : 0.0;

        return DailyQuestDto.builder()
                .id(quest.getId())
                .userId(quest.getUserId())
                .questDate(quest.getQuestDate())
                .questType(quest.getQuestType())
                .title(quest.getTitle())
                .description(quest.getDescription())
                .targetCount(quest.getTargetCount())
                .currentCount(quest.getCurrentCount())
                .xpReward(quest.getXpReward())
                .isCompleted(quest.getIsCompleted())
                .isClaimed(quest.getIsClaimed())
                .progressPercentage(Math.round(pct * 10.0) / 10.0)
                .build();
    }
}
