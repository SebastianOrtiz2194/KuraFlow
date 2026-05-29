package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.LeaderboardEntryDto;
import com.kuraflow.gamification.dto.LeaderboardResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class LeaderboardService {

    private final StringRedisTemplate redisTemplate;
    private final UserServiceClient userServiceClient;
    private final String weeklyKeyPrefix;
    private final String alltimeKey;
    private final int pageSize;

    public LeaderboardService(
            StringRedisTemplate redisTemplate,
            UserServiceClient userServiceClient,
            @Value("${app.leaderboard.weekly-key}") String weeklyKeyPrefix,
            @Value("${app.leaderboard.alltime-key}") String alltimeKey,
            @Value("${app.leaderboard.page-size}") int pageSize) {
        this.redisTemplate = redisTemplate;
        this.userServiceClient = userServiceClient;
        this.weeklyKeyPrefix = weeklyKeyPrefix;
        this.alltimeKey = alltimeKey;
        this.pageSize = pageSize;
    }

    /**
     * Adds XP for a user to both the weekly and all-time leaderboards.
     */
    public void addXp(UUID userId, int xpEarned) {
        String userIdStr = userId.toString();
        
        // All-time leaderboard
        redisTemplate.opsForZSet().incrementScore(alltimeKey, userIdStr, xpEarned);
        
        // Weekly leaderboard (key includes the current week's Monday date)
        String weeklyKey = getCurrentWeeklyKey();
        redisTemplate.opsForZSet().incrementScore(weeklyKey, userIdStr, xpEarned);
        
        log.debug("Added {} XP for user {} to leaderboards", xpEarned, userId);
    }

    /**
     * Synchronizes a user's total XP with the all-time leaderboard.
     * Used when a user's XP is set directly (e.g., badge rewards).
     */
    public void syncTotalXp(UUID userId, int totalXp) {
        String userIdStr = userId.toString();
        redisTemplate.opsForZSet().add(alltimeKey, userIdStr, totalXp);
        log.debug("Synced total XP {} for user {} on all-time leaderboard", totalXp, userId);
    }

    /**
     * Gets the all-time leaderboard (top N users).
     */
    public LeaderboardResponse getAllTimeLeaderboard(UUID requestingUserId) {
        return getLeaderboard(alltimeKey, "alltime", requestingUserId);
    }

    /**
     * Gets the weekly leaderboard (top N users for this week).
     */
    public LeaderboardResponse getWeeklyLeaderboard(UUID requestingUserId) {
        return getLeaderboard(getCurrentWeeklyKey(), "weekly", requestingUserId);
    }

    /**
     * Gets the rank of a specific user in the all-time leaderboard.
     * Returns null if the user is not on the board.
     */
    public Integer getAllTimeRank(UUID userId) {
        Long rank = redisTemplate.opsForZSet().reverseRank(alltimeKey, userId.toString());
        return rank != null ? rank.intValue() + 1 : null;
    }

    /**
     * Gets the rank of a specific user in the weekly leaderboard.
     */
    public Integer getWeeklyRank(UUID userId) {
        Long rank = redisTemplate.opsForZSet().reverseRank(getCurrentWeeklyKey(), userId.toString());
        return rank != null ? rank.intValue() + 1 : null;
    }

    private LeaderboardResponse getLeaderboard(String key, String type, UUID requestingUserId) {
        // Get top entries (descending by score)
        Set<ZSetOperations.TypedTuple<String>> topEntries = 
                redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, pageSize - 1);

        // Collect all user IDs for batch profile fetch
        Set<UUID> userIdsToFetch = new HashSet<>();

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;

        if (topEntries != null) {
            for (ZSetOperations.TypedTuple<String> entry : topEntries) {
                UUID userId = UUID.fromString(entry.getValue());
                userIdsToFetch.add(userId);
                entries.add(LeaderboardEntryDto.builder()
                        .rank(rank++)
                        .userId(userId)
                        .displayName(null) // will be filled after batch fetch
                        .score(entry.getScore() != null ? entry.getScore().longValue() : 0L)
                        .build());
            }
        }

        // Get requesting user's entry
        if (requestingUserId != null) {
            userIdsToFetch.add(requestingUserId);
        }

        // Batch fetch all display names and avatars
        userServiceClient.batchFetchProfiles(userIdsToFetch);

        // Populate display names and avatars
        for (LeaderboardEntryDto entry : entries) {
            entry.setDisplayName(userServiceClient.getDisplayName(entry.getUserId()));
            entry.setAvatarUrl(userServiceClient.getAvatarUrl(entry.getUserId()));
        }

        // Get requesting user's entry
        LeaderboardEntryDto currentUser = null;
        if (requestingUserId != null) {
            String userIdStr = requestingUserId.toString();
            Long userRank = redisTemplate.opsForZSet().reverseRank(key, userIdStr);
            Double userScore = redisTemplate.opsForZSet().score(key, userIdStr);
            
            if (userRank != null && userScore != null) {
                currentUser = LeaderboardEntryDto.builder()
                        .rank(userRank.intValue() + 1)
                        .userId(requestingUserId)
                        .displayName(userServiceClient.getDisplayName(requestingUserId))
                        .avatarUrl(userServiceClient.getAvatarUrl(requestingUserId))
                        .score(userScore.longValue())
                        .build();
            }
        }

        Long totalParticipants = redisTemplate.opsForZSet().zCard(key);

        return LeaderboardResponse.builder()
                .type(type)
                .entries(entries)
                .currentUser(currentUser)
                .totalParticipants(totalParticipants != null ? totalParticipants : 0L)
                .build();
    }

    /**
     * Generates the Redis key for the current week's leaderboard.
     * Format: leaderboard:weekly:2026-W20
     */
    private String getCurrentWeeklyKey() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        String weekId = monday.format(DateTimeFormatter.ISO_LOCAL_DATE);
        return weeklyKeyPrefix + ":" + weekId;
    }

    /**
     * Weekly leaderboard cleanup. Runs every Monday at 00:01 UTC.
     * Deletes leaderboard keys older than 4 weeks.
     */
    @Scheduled(cron = "0 1 0 * * MON", zone = "UTC")
    public void cleanupOldWeeklyLeaderboards() {
        log.info("Cleaning up old weekly leaderboards...");
        LocalDate fourWeeksAgo = LocalDate.now().minusWeeks(4)
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        // Delete up to 10 old keys (safety limit)
        for (int i = 0; i < 10; i++) {
            LocalDate weekToDelete = fourWeeksAgo.minusWeeks(i);
            String oldKey = weeklyKeyPrefix + ":" + weekToDelete.format(DateTimeFormatter.ISO_LOCAL_DATE);
            Boolean deleted = redisTemplate.delete(oldKey);
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Deleted old weekly leaderboard: {}", oldKey);
            }
        }
    }
}
