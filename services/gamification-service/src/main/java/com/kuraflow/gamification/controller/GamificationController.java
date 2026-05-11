package com.kuraflow.gamification.controller;

import com.kuraflow.gamification.dto.UserStreakDto;
import com.kuraflow.gamification.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final StreakService streakService;

    @GetMapping("/streak/{userId}")
    public ResponseEntity<UserStreakDto> getUserStreak(@PathVariable UUID userId) {
        return ResponseEntity.ok(streakService.getUserStreak(userId));
    }

    @PostMapping("/streak/{userId}/freeze")
    public ResponseEntity<Void> purchaseFreeze(@PathVariable UUID userId) {
        try {
            streakService.purchaseFreeze(userId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
