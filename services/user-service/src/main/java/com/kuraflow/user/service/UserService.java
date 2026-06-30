package com.kuraflow.user.service;

import com.kuraflow.user.dto.UpdateProfileRequest;
import com.kuraflow.user.dto.UserProfileResponse;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.entity.UserFollow;
import com.kuraflow.user.entity.UserFollowId;
import com.kuraflow.user.repository.UserFollowRepository;
import com.kuraflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
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
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

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
