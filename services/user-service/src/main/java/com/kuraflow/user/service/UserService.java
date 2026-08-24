package com.kuraflow.user.service;

import com.kuraflow.user.dto.UpdateProfileRequest;
import com.kuraflow.user.dto.UserBriefResponse;
import com.kuraflow.user.dto.UserProfileResponse;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.entity.UserFollow;
import com.kuraflow.user.entity.UserFollowId;
import com.kuraflow.user.repository.UserFollowRepository;
import com.kuraflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> autoProvisionUser(userId, null, null));
        return toResponse(user);
    }

    public UserProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> autoProvisionUser(userId, null, null));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPreferredLanguageId() != null) {
            user.setPreferredLanguageId(request.getPreferredLanguageId());
        }
        if (request.getCurrentLevelId() != null) {
            user.setCurrentLevelId(request.getCurrentLevelId());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }

        return toResponse(userRepository.save(user));
    }

    public List<UserBriefResponse> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        List<User> users = userRepository.findByDisplayNameContainingIgnoreCase(query.trim());
        return users.stream()
                .limit(20)
                .map(u -> UserBriefResponse.builder()
                        .id(u.getId())
                        .displayName(u.getDisplayName())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();
    }

    @Transactional
    public void followUser(UUID followerId, UUID followedId) {
        if (followerId.equals(followedId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        UserFollowId id = new UserFollowId(followerId, followedId);
        if (!userFollowRepository.existsById(id)) {
            UserFollow follow = UserFollow.builder()
                    .followerId(followerId)
                    .followedId(followedId)
                    .build();
            userFollowRepository.save(follow);
        }
    }

    @Transactional
    public void unfollowUser(UUID followerId, UUID followedId) {
        UserFollowId id = new UserFollowId(followerId, followedId);
        if (userFollowRepository.existsById(id)) {
            userFollowRepository.deleteById(id);
        }
    }

    public List<UUID> getFollowingIds(UUID userId) {
        return userFollowRepository.findFollowedIdsByFollowerId(userId);
    }

    public List<UUID> getFollowerIds(UUID userId) {
        return userFollowRepository.findFollowerIdsByFollowedId(userId);
    }

    @Transactional
    public User autoProvisionUser(UUID userId, String email, String displayName) {
        log.info("Auto-provisioning missing user record for userId: {}", userId);
        String resolvedEmail = email != null ? email : userId.toString().substring(0, 8) + "@kuraflow.local";
        String resolvedName = displayName != null ? displayName : "Learner " + userId.toString().substring(0, 4);

        User user = User.builder()
                .id(userId)
                .email(resolvedEmail)
                .displayName(resolvedName)
                .authProvider("local")
                .timezone("UTC")
                .isPremium(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        return userRepository.save(user);
    }

    private UserProfileResponse toResponse(User user) {
        long followersCount = userFollowRepository.countByFollowedId(user.getId());
        long followingCount = userFollowRepository.countByFollowerId(user.getId());
        
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .authProvider(user.getAuthProvider())
                .preferredLanguageId(user.getPreferredLanguageId())
                .currentLevelId(user.getCurrentLevelId())
                .timezone(user.getTimezone())
                .isPremium(user.getIsPremium())
                .createdAt(user.getCreatedAt())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .build();
    }
}
