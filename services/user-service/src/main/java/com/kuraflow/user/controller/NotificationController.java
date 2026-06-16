package com.kuraflow.user.controller;

import com.kuraflow.shared.security.SecurityContextUtils;
import com.kuraflow.user.dto.PushSubscriptionRequest;
import com.kuraflow.user.entity.PushSubscription;
import com.kuraflow.user.entity.User;
import com.kuraflow.user.repository.PushSubscriptionRepository;
import com.kuraflow.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@Valid @RequestBody PushSubscriptionRequest request) {
        UUID userId = SecurityContextUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        pushSubscriptionRepository.findByUserIdAndEndpoint(userId, request.getEndpoint())
                .ifPresentOrElse(
                        sub -> {
                            sub.setP256dh(request.getP256dh());
                            sub.setAuth(request.getAuth());
                            pushSubscriptionRepository.save(sub);
                        },
                        () -> {
                            PushSubscription sub = new PushSubscription();
                            sub.setUser(user);
                            sub.setEndpoint(request.getEndpoint());
                            sub.setP256dh(request.getP256dh());
                            sub.setAuth(request.getAuth());
                            pushSubscriptionRepository.save(sub);
                        }
                );

        return ResponseEntity.ok().build();
    }
}
