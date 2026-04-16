package com.kuraflow.user.controller;

import com.kuraflow.user.dto.UpdateProfileRequest;
import com.kuraflow.user.dto.UserProfileResponse;
import com.kuraflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for managing user profiles and preferences")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getProfile(id));
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

    @GetMapping("/health")
    @Operation(summary = "Health check for user-service")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("user-service is running");
    }
}
