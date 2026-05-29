package com.kuraflow.user.controller;

import com.kuraflow.user.dto.UserBriefResponse;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;
    private final com.kuraflow.user.service.UserService userService;

    @PostMapping("/profiles")
    public ResponseEntity<Map<UUID, UserBriefResponse>> getBatchProfiles(@RequestBody List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.ok(Map.of());
        }

        List<User> users = userRepository.findAllById(userIds);

        Map<UUID, UserBriefResponse> result = users.stream()
                .collect(Collectors.toMap(
                        User::getId,
                        user -> UserBriefResponse.builder()
                                .id(user.getId())
                                .displayName(user.getDisplayName())
                                .avatarUrl(user.getAvatarUrl())
                                .build()
                ));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UUID>> getFollowingIds(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getFollowingIds(id));
    }
}
