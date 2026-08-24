package com.kuraflow.auth.util;

import com.kuraflow.shared.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "secret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtils, "expiration", 3600L);
        ReflectionTestUtils.setField(jwtUtils, "refreshExpiration", 604800L);
    }

    @Test
    @DisplayName("Generate and Validate JWT Token with CustomUserDetails")
    void generateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        CustomUserDetails userDetails = new CustomUserDetails(userId, "test@kuraflow.com", "password");

        String token = jwtUtils.generateToken(userDetails);
        assertThat(token).isNotEmpty();

        String username = jwtUtils.extractUsername(token);
        assertThat(username).isEqualTo("test@kuraflow.com");

        boolean isValid = jwtUtils.validateToken(token, userDetails);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Generate and Validate Refresh Token")
    void generateAndValidateRefreshToken() {
        UUID userId = UUID.randomUUID();
        CustomUserDetails userDetails = new CustomUserDetails(userId, "refresh@kuraflow.com", "password");

        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        assertThat(refreshToken).isNotEmpty();

        String username = jwtUtils.extractUsername(refreshToken);
        assertThat(username).isEqualTo("refresh@kuraflow.com");
    }
}
