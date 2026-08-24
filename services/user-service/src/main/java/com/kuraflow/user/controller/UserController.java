package com.kuraflow.user.controller;

import com.kuraflow.user.dto.UpdateProfileRequest;
import com.kuraflow.user.dto.UserBriefResponse;
import com.kuraflow.user.dto.UserProfileResponse;
import com.kuraflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for managing user profiles and preferences")
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    @Operation(summary = "Search users by display name")
    public ResponseEntity<List<UserBriefResponse>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user's profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(@org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user profile by email")
    public ResponseEntity<UserProfileResponse> getProfileByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getProfileByEmail(email));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current authenticated user's profile")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check for user-service")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("user-service is running");
    }

    @PostMapping("/me/following/{targetId}")
    @Operation(summary = "Follow a user")
    public ResponseEntity<Void> followUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @PathVariable UUID targetId) {
        userService.followUser(userDetails.getId(), targetId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/following/{targetId}")
    @Operation(summary = "Unfollow a user")
    public ResponseEntity<Void> unfollowUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kuraflow.shared.security.CustomUserDetails userDetails,
            @PathVariable UUID targetId) {
        userService.unfollowUser(userDetails.getId(), targetId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/following")
    @Operation(summary = "Get list of user IDs that this user is following")
    public ResponseEntity<java.util.List<UUID>> getFollowingIds(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getFollowingIds(id));
    }

    @GetMapping("/{id}/followers")
    @Operation(summary = "Get list of user IDs that follow this user")
    public ResponseEntity<java.util.List<UUID>> getFollowersIds(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getFollowerIds(id));
    }
}
