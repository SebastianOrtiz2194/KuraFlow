package com.kuraflow.gamification.controller;

import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final UserStreakRepository userStreakRepository;

    @GetMapping("/streak/{userId}")
    public ResponseEntity<UserStreak> getUserStreak(@PathVariable UUID userId) {
        return userStreakRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
