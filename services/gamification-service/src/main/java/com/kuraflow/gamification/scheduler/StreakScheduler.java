package com.kuraflow.gamification.scheduler;

import com.kuraflow.gamification.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StreakScheduler {

    private final StreakService streakService;

    @Scheduled(cron = "0 5 0 * * *", zone = "UTC")
    public void dailyStreakCheck() {
        log.info("Starting daily streak check...");
        streakService.cleanupExpiredStreaks();
        log.info("Daily streak check completed.");
    }
}
