package com.kuraflow.gamification.service;

import com.kuraflow.gamification.dto.ActivityHeatmapDto;
import com.kuraflow.gamification.dto.ActivityItemDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ActivityHistoryService {

    private static final String ACTIVITY_KEY_PREFIX = "activity:";
    private static final String DAILY_MAP_PREFIX = "activity:daily:";
    private static final int MAX_ACTIVITIES = 20;
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private final StringRedisTemplate redisTemplate;

    public ActivityHistoryService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void recordActivity(UUID userId, String type, String description, int xpEarned, Instant timestamp) {
        try {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("type", type);
            item.put("description", description);
            item.put("xpEarned", xpEarned);
            item.put("timestamp", timestamp.toString());

            String json = objectMapper.writeValueAsString(item);
            String key = ACTIVITY_KEY_PREFIX + userId;

            // Push to left (newest first), trim to max
            redisTemplate.opsForList().leftPush(key, json);
            redisTemplate.opsForList().trim(key, 0, MAX_ACTIVITIES - 1);

            // Record into daily heatmap hash
            LocalDate date = timestamp.atZone(ZoneId.of("UTC")).toLocalDate();
            String dateKey = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            String dailyHashKey = DAILY_MAP_PREFIX + userId;

            Object existing = redisTemplate.opsForHash().get(dailyHashKey, dateKey);
            int count = 1;
            int totalXp = xpEarned;
            if (existing != null) {
                String[] parts = existing.toString().split(":");
                if (parts.length == 2) {
                    count += Integer.parseInt(parts[0]);
                    totalXp += Integer.parseInt(parts[1]);
                }
            }
            redisTemplate.opsForHash().put(dailyHashKey, dateKey, count + ":" + totalXp);

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize activity for user {}", userId, e);
        }
    }

    public List<ActivityItemDto> getRecentActivities(UUID userId) {
        String key = ACTIVITY_KEY_PREFIX + userId;
        List<String> items = redisTemplate.opsForList().range(key, 0, MAX_ACTIVITIES - 1);

        if (items == null || items.isEmpty()) {
            return List.of();
        }

        return items.stream()
                .map(this::parseActivity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<ActivityHeatmapDto> getHeatmap(UUID userId, int days) {
        int targetDays = Math.min(Math.max(days, 7), 365);
        String dailyHashKey = DAILY_MAP_PREFIX + userId;
        Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(dailyHashKey);

        List<ActivityHeatmapDto> heatmap = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneId.of("UTC"));

        for (int i = targetDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            Object val = rawEntries.get(dateStr);

            int count = 0;
            int xp = 0;
            int level = 0;

            if (val != null) {
                String[] parts = val.toString().split(":");
                if (parts.length == 2) {
                    count = Integer.parseInt(parts[0]);
                    xp = Integer.parseInt(parts[1]);
                    if (xp >= 100 || count >= 5) {
                        level = 4;
                    } else if (xp >= 50 || count >= 3) {
                        level = 3;
                    } else if (xp >= 20 || count >= 2) {
                        level = 2;
                    } else if (xp > 0 || count > 0) {
                        level = 1;
                    }
                }
            }

            heatmap.add(ActivityHeatmapDto.builder()
                    .date(date)
                    .count(count)
                    .xp(xp)
                    .level(level)
                    .build());
        }

        return heatmap;
    }

    private ActivityItemDto parseActivity(String json) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return ActivityItemDto.builder()
                    .type(map.get("type") != null ? map.get("type").toString() : "unknown")
                    .description(map.get("description") != null ? map.get("description").toString() : "")
                    .xpEarned(map.get("xpEarned") != null ? ((Number) map.get("xpEarned")).intValue() : 0)
                    .timestamp(map.get("timestamp") != null ? Instant.parse(map.get("timestamp").toString()) : Instant.now())
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse activity JSON: {}", e.getMessage());
            return null;
        }
    }
}
