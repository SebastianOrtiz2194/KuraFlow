package com.kuraflow.user.service;

import com.kuraflow.user.dto.UpdateProfileRequest;
import com.kuraflow.user.dto.UserBriefResponse;
import com.kuraflow.user.dto.UserProfileResponse;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.entity.UserFollow;
import com.kuraflow.user.entity.UserFollowId;
import com.kuraflow.user.repository.UserFollowRepository;
import com.kuraflow.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository userFollowRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("getProfile: Returns existing user profile with follower counts")
    void getProfile_ExistingUser() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@kuraflow.com")
                .displayName("Kura Learner")
                .avatarUrl("http://avatar.png")
                .timezone("UTC")
                .isPremium(false)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userFollowRepository.countByFollowedId(userId)).thenReturn(10L);
        when(userFollowRepository.countByFollowerId(userId)).thenReturn(5L);

        UserProfileResponse response = userService.getProfile(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(userId);
        assertThat(response.getEmail()).isEqualTo("user@kuraflow.com");
        assertThat(response.getFollowersCount()).isEqualTo(10L);
        assertThat(response.getFollowingCount()).isEqualTo(5L);
    }

    @Test
    @DisplayName("getProfile: Auto-provisions profile if user record missing")
    void getProfile_AutoProvisionsIfMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserProfileResponse response = userService.getProfile(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(userId);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("updateProfile: Updates fields correctly")
    void updateProfile_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@kuraflow.com")
                .displayName("Old Name")
                .timezone("UTC")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setDisplayName("New Name");
        request.setTimezone("Asia/Tokyo");

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertThat(response.getDisplayName()).isEqualTo("New Name");
        assertThat(response.getTimezone()).isEqualTo("Asia/Tokyo");
    }

    @Test
    @DisplayName("searchUsers: Returns matching brief user profiles")
    void searchUsers_Success() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .displayName("Alice in Wonderland")
                .avatarUrl("http://alice.png")
                .build();

        when(userRepository.findByDisplayNameContainingIgnoreCase("alice")).thenReturn(List.of(user));

        List<UserBriefResponse> results = userService.searchUsers("alice");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getDisplayName()).isEqualTo("Alice in Wonderland");
    }

    @Test
    @DisplayName("followUser: Successfully saves follow relation")
    void followUser_Success() {
        UUID followerId = UUID.randomUUID();
        UUID followedId = UUID.randomUUID();
        UserFollowId followId = new UserFollowId(followerId, followedId);

        when(userFollowRepository.existsById(followId)).thenReturn(false);

        userService.followUser(followerId, followedId);

        verify(userFollowRepository).save(any(UserFollow.class));
    }

    @Test
    @DisplayName("followUser: Throws exception when attempting to follow self")
    void followUser_SelfFollowThrows() {
        UUID userId = UUID.randomUUID();
        assertThatThrownBy(() -> userService.followUser(userId, userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot follow yourself");
    }
}
