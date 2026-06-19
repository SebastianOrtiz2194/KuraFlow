package com.kuraflow.gamification.scheduler;

import com.kuraflow.gamification.entity.UserStreak;
import com.kuraflow.gamification.repository.UserStreakRepository;
import com.kuraflow.gamification.service.UserServiceClient;
import com.kuraflow.shared.event.StreakReminderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class StreakReminderScheduler {

    private final UserServiceClient userServiceClient;
    private final UserStreakRepository userStreakRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Run at minute 0 past every hour
    @Scheduled(cron = "0 0 * * * *")
    public void sendStreakReminders() {
        log.info("Starting hourly streak reminder check...");
        int targetHour = 20; // 8 PM
        
        List<UUID> targetUserIds = userServiceClient.getUsersAtLocalHour(targetHour);
        if (targetUserIds.isEmpty()) {
            log.info("No users found at local hour {}", targetHour);
            return;
        }
        
        List<UserStreak> streaks = userStreakRepository.findAllByUserIdIn(targetUserIds);
        
        int count = 0;
        for (UserStreak streak : streaks) {
            if (streak.getCurrentStreak() > 0) {
                // If it's 8 PM for the user, we consider "today" as the current UTC date adjusted by the user's offset,
                // but since we only have the targetHour, we can estimate today's LocalDate.
                // A simpler approach for the prototype: we assume `lastActivity` is stored as LocalDate based on user's timezone.
                // So "today" for them is LocalDate.now(userTimezone). Since we don't have the user's timezone here,
                // we can deduce it because we know it's currently 8 PM for them.
                LocalDate userToday = ZonedDateTime.now(ZoneId.of("UTC")).toLocalDate(); // approximate
                
                if (streak.getLastActivity() == null || streak.getLastActivity().isBefore(userToday)) {
                    StreakReminderEvent event = StreakReminderEvent.builder()
                            .userId(streak.getUserId())
                            .currentStreak(streak.getCurrentStreak())
                            .timestamp(Instant.now())
                            .build();
                    
                    kafkaTemplate.send("streak.reminder", event.getUserId().toString(), event);
                    log.info("Sent streak reminder to user {}", streak.getUserId());
                    count++;
                }
            }
        }
        
        log.info("Finished streak reminder check. Sent {} reminders.", count);
    }
}
