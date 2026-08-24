package com.kuraflow.auth.service;

import com.kuraflow.auth.dto.AuthResponse;
import com.kuraflow.auth.dto.LoginRequest;
import com.kuraflow.auth.dto.RegisterRequest;
import com.kuraflow.auth.entity.UserCredential;
import com.kuraflow.auth.repository.UserCredentialRepository;
import com.kuraflow.auth.util.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "userRegisteredTopic", "user.registered");
    }

    @Test
    @DisplayName("Register: Successfully registers new user, saves credential, and emits Kafka event")
    void register_Success() {
        RegisterRequest request = new RegisterRequest("test@kuraflow.com", "Password123!", "Test User");

        when(userCredentialRepository.existsByEmail("test@kuraflow.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");
        when(userCredentialRepository.save(any(UserCredential.class))).thenAnswer(i -> i.getArgument(0));

        UserDetails userDetails = new User("test@kuraflow.com", "hashedPassword", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("test@kuraflow.com")).thenReturn(userDetails);
        when(jwtUtils.generateToken(userDetails)).thenReturn("jwt.access.token");
        when(jwtUtils.generateRefreshToken(userDetails)).thenReturn("jwt.refresh.token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("jwt.refresh.token");
        assertThat(response.getEmail()).isEqualTo("test@kuraflow.com");

        verify(userCredentialRepository).save(any(UserCredential.class));
        verify(kafkaTemplate).send(eq("user.registered"), anyString(), any());
    }

    @Test
    @DisplayName("Register: Throws IllegalArgumentException if email already registered")
    void register_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("existing@kuraflow.com", "Password123!", "Existing User");
        when(userCredentialRepository.existsByEmail("existing@kuraflow.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");

        verify(userCredentialRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Login: Successfully authenticates and returns access/refresh tokens")
    void login_Success() {
        LoginRequest request = new LoginRequest("user@kuraflow.com", "Password123!");
        UserDetails userDetails = new User("user@kuraflow.com", "hashedPassword", Collections.emptyList());

        when(userDetailsService.loadUserByUsername("user@kuraflow.com")).thenReturn(userDetails);
        when(jwtUtils.generateToken(userDetails)).thenReturn("access.token");
        when(jwtUtils.generateRefreshToken(userDetails)).thenReturn("refresh.token");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access.token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token");
        assertThat(response.getEmail()).isEqualTo("user@kuraflow.com");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Login: Throws BadCredentialsException when authentication fails")
    void login_InvalidCredentials() {
        LoginRequest request = new LoginRequest("wrong@kuraflow.com", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Refresh: Successfully refreshes token with valid refresh token")
    void refresh_Success() {
        String refreshToken = "valid.refresh.token";
        UserDetails userDetails = new User("user@kuraflow.com", "hashedPassword", Collections.emptyList());

        when(jwtUtils.extractUsername(refreshToken)).thenReturn("user@kuraflow.com");
        when(userDetailsService.loadUserByUsername("user@kuraflow.com")).thenReturn(userDetails);
        when(jwtUtils.validateToken(refreshToken, userDetails)).thenReturn(true);
        when(jwtUtils.generateToken(userDetails)).thenReturn("new.access.token");

        AuthResponse response = authService.refresh(refreshToken);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new.access.token");
        assertThat(response.getRefreshToken()).isEqualTo(refreshToken);
    }

    @Test
    @DisplayName("Refresh: Throws IllegalArgumentException on invalid refresh token")
    void refresh_InvalidToken() {
        String refreshToken = "invalid.token";
        UserDetails userDetails = new User("user@kuraflow.com", "hashedPassword", Collections.emptyList());

        when(jwtUtils.extractUsername(refreshToken)).thenReturn("user@kuraflow.com");
        when(userDetailsService.loadUserByUsername("user@kuraflow.com")).thenReturn(userDetails);
        when(jwtUtils.validateToken(refreshToken, userDetails)).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(refreshToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid refresh token");
    }
}
