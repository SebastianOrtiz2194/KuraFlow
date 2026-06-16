package com.kuraflow.user.repository;

import com.kuraflow.user.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {
    List<PushSubscription> findByUserId(UUID userId);
    Optional<PushSubscription> findByUserIdAndEndpoint(UUID userId, String endpoint);
    void deleteByEndpoint(String endpoint);
}
