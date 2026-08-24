package com.kuraflow.gamification.controller;

import com.kuraflow.gamification.dto.*;
import com.kuraflow.gamification.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Gamification API", description = "Endpoints for Streaks, Leaderboards, Badges, Daily Quests, and Heatmaps")
public class GamificationController {

    private final StreakService streakService;
    private final LeaderboardService leaderboardService;
    private final ProfileService profileService;
    private final ActivityHistoryService activityHistoryService;
    private final DailyQuestService dailyQuestService;

    // ==================== Streak Endpoints ====================

    @GetMapping("/streak/{userId}")
    @Operation(summary = "Get streak information for a user by ID")
    public ResponseEntity<UserStreakDto> getUserStreak(@PathVariable UUID userId) {
        return ResponseEntity.ok(streakService.getUserStreak(userId));
    }

    @GetMapping("/streak/me")
    @Operation(summary = "Get current authenticated user's streak details")
    public ResponseEntity<UserStreakDto> getMyStreak(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(streakService.getUserStreak(userDetails.getId()));
    }

    @PostMapping("/streak/me/freeze")
    @Operation(summary = "Purchase a streak freeze using earned XP")
    public ResponseEntity<Void> purchaseFreeze(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        streakService.purchaseFreeze(userDetails.getId());
        return ResponseEntity.ok().build();
    }

    // ==================== Daily Quests Endpoints ====================

    @GetMapping("/quests/daily")
    @Operation(summary = "Get today's daily quests and real-time completion progress")
    public ResponseEntity<List<DailyQuestDto>> getDailyQuests(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(dailyQuestService.getDailyQuests(userDetails.getId()));
    }

    @PostMapping("/quests/{questId}/claim")
    @Operation(summary = "Claim bonus XP rewards for a completed daily quest")
    public ResponseEntity<ClaimQuestResponse> claimQuest(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @PathVariable UUID questId) {
        return ResponseEntity.ok(dailyQuestService.claimQuest(userDetails.getId(), questId));
    }

    // ==================== Leaderboard Endpoints ====================

    @GetMapping("/leaderboard/alltime")
    @Operation(summary = "Get all-time global XP leaderboard")
    public ResponseEntity<LeaderboardResponse> getAllTimeLeaderboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        UUID userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(leaderboardService.getAllTimeLeaderboard(userId));
    }

    @GetMapping("/leaderboard/weekly")
    @Operation(summary = "Get this week's XP leaderboard")
    public ResponseEntity<LeaderboardResponse> getWeeklyLeaderboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        UUID userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard(userId));
    }

    @GetMapping("/leaderboard/friends")
    @Operation(summary = "Get friends XP leaderboard")
    public ResponseEntity<LeaderboardResponse> getFriendsLeaderboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @RequestParam(defaultValue = "weekly") String timeframe) {
        UUID userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(leaderboardService.getFriendsLeaderboard(userId, timeframe));
    }

    // ==================== Profile Endpoints ====================

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get gamified user profile including badges, ranks, and streak")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getUserProfile(userId));
    }

    @GetMapping("/profile/me")
    @Operation(summary = "Get current authenticated user's gamified profile")
    public ResponseEntity<UserProfileDto> getMyProfile(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getUserProfile(userDetails.getId()));
    }

    // ==================== Activity History & Heatmap Endpoints ====================

    @GetMapping("/profile/me/history")
    @Operation(summary = "Get recent activity history items")
    public ResponseEntity<List<ActivityItemDto>> getMyActivityHistory(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(activityHistoryService.getRecentActivities(userDetails.getId()));
    }

    @GetMapping("/profile/me/heatmap")
    @Operation(summary = "Get 365-day activity density heatmap and XP breakdown")
    public ResponseEntity<List<ActivityHeatmapDto>> getMyHeatmap(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @RequestParam(defaultValue = "365") int days) {
        return ResponseEntity.ok(activityHistoryService.getHeatmap(userDetails.getId(), days));
    }
}
