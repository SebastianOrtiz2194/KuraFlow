package com.kuraflow.auth.service;

import com.kuraflow.auth.dto.AuthResponse;
import com.kuraflow.auth.dto.LoginRequest;
import com.kuraflow.auth.dto.RegisterRequest;
import com.kuraflow.auth.entity.UserCredential;
import com.kuraflow.auth.repository.UserCredentialRepository;
import com.kuraflow.auth.util.JwtUtils;
import com.kuraflow.shared.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.user-registered:user.registered}")
    private String userRegisteredTopic;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        UUID userId = UUID.randomUUID();
        UserCredential credential = UserCredential.builder()
                .id(userId)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .authProvider("local")
                .build();

        userCredentialRepository.save(credential);

        // Publish event for user-service and downstream consumers
        try {
            UserRegisteredEvent event = UserRegisteredEvent.builder()
                    .userId(userId)
                    .email(credential.getEmail())
                    .displayName(credential.getDisplayName())
                    .authProvider(credential.getAuthProvider())
                    .timestamp(Instant.now())
                    .build();
            kafkaTemplate.send(userRegisteredTopic, userId.toString(), event);
            log.info("Published UserRegisteredEvent for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to publish UserRegisteredEvent for user: {}", userId, e);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(credential.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(request.getEmail())
                .build();
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtUtils.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        
        if (jwtUtils.validateToken(refreshToken, userDetails)) {
            String newAccessToken = jwtUtils.generateToken(userDetails);
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .email(email)
                    .build();
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }
}
