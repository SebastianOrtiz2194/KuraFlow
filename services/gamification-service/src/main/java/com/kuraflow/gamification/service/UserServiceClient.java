package com.kuraflow.gamification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceBaseUrl;
    private final Map<UUID, CachedProfile> profileCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = TimeUnit.MINUTES.toMillis(5);

    private record CachedProfile(String displayName, String avatarUrl, long cachedAt) {}

    public UserServiceClient(RestTemplate restTemplate,
                             @Value("${app.user-service.base-url}") String userServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    public String getDisplayName(UUID userId) {
        CachedProfile cached = profileCache.get(userId);
        if (cached != null && (System.currentTimeMillis() - cached.cachedAt) < CACHE_TTL_MS) {
            return cached.displayName;
        }
        batchFetchProfiles(Set.of(userId));
        cached = profileCache.get(userId);
        return cached != null ? cached.displayName : "User-" + userId.toString().substring(0, 8);
    }

    public String getAvatarUrl(UUID userId) {
        CachedProfile cached = profileCache.get(userId);
        if (cached != null && (System.currentTimeMillis() - cached.cachedAt) < CACHE_TTL_MS) {
            return cached.avatarUrl;
        }
        batchFetchProfiles(Set.of(userId));
        cached = profileCache.get(userId);
        return cached != null ? cached.avatarUrl : null;
    }

    public void batchFetchProfiles(Set<UUID> userIds) {
        Set<UUID> toFetch = new HashSet<>();
        for (UUID id : userIds) {
            CachedProfile cached = profileCache.get(id);
            if (cached == null || (System.currentTimeMillis() - cached.cachedAt) >= CACHE_TTL_MS) {
                toFetch.add(id);
            }
        }
        if (toFetch.isEmpty()) return;

        try {
            String url = userServiceBaseUrl + "/api/system/users/profiles";
            ResponseEntity<Map<UUID, Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new org.springframework.http.HttpEntity<>(new ArrayList<>(toFetch)),
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getBody() != null) {
                long now = System.currentTimeMillis();
                for (var entry : response.getBody().entrySet()) {
                    UUID id = entry.getKey();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = entry.getValue();
                    String displayName = data != null && data.get("displayName") != null
                            ? data.get("displayName").toString()
                            : "User-" + id.toString().substring(0, 8);
                    String avatarUrl = data != null && data.get("avatarUrl") != null
                            ? data.get("avatarUrl").toString()
                            : null;
                    profileCache.put(id, new CachedProfile(displayName, avatarUrl, now));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user profiles from user-service: {}", e.getMessage());
        }
    }

    public List<UUID> getFollowingIds(UUID userId) {
        try {
            String url = userServiceBaseUrl + "/api/system/users/" + userId + "/following";
            ResponseEntity<List<UUID>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch following IDs for user {}: {}", userId, e.getMessage());
        }
        return Collections.emptyList();
    }

    public List<UUID> getUsersAtLocalHour(int hour) {
        try {
            String url = userServiceBaseUrl + "/api/system/users/timezone/" + hour;
            ResponseEntity<List<UUID>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch users at local hour {}: {}", hour, e.getMessage());
        }
        return Collections.emptyList();
    }
}
