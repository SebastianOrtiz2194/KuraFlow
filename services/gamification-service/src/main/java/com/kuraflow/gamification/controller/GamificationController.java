package com.kuraflow.gamification.controller;

import com.kuraflow.gamification.dto.LeaderboardResponse;
import com.kuraflow.gamification.dto.UserProfileDto;
import com.kuraflow.gamification.dto.UserStreakDto;
import com.kuraflow.gamification.service.LeaderboardService;
import com.kuraflow.gamification.service.ProfileService;
import com.kuraflow.gamification.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GamificationController {

    private final StreakService streakService;
    private final LeaderboardService leaderboardService;
    private final ProfileService profileService;

    // ==================== Streak Endpoints ====================

    @GetMapping("/streak/{userId}")
    public ResponseEntity<UserStreakDto> getUserStreak(@PathVariable UUID userId) {
        return ResponseEntity.ok(streakService.getUserStreak(userId));
    }

    @GetMapping("/streak/me")
    public ResponseEntity<UserStreakDto> getMyStreak(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(streakService.getUserStreak(userDetails.getId()));
    }

    @PostMapping("/streak/me/freeze")
    public ResponseEntity<Void> purchaseFreeze(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        try {
            streakService.purchaseFreeze(userDetails.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== Leaderboard Endpoints ====================

    @GetMapping("/leaderboard/alltime")
    public ResponseEntity<LeaderboardResponse> getAllTimeLeaderboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        UUID userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(leaderboardService.getAllTimeLeaderboard(userId));
    }

    @GetMapping("/leaderboard/weekly")
    public ResponseEntity<LeaderboardResponse> getWeeklyLeaderboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        UUID userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard(userId));
    }

    // ==================== Profile Endpoints ====================

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getUserProfile(userId));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<UserProfileDto> getMyProfile(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getUserProfile(userDetails.getId()));
    }
}
