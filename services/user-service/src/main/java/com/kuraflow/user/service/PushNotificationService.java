package com.kuraflow.user.service;

import com.kuraflow.user.entity.PushSubscription;
import com.kuraflow.user.repository.PushSubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class PushNotificationService {

    private final PushSubscriptionRepository repository;
    private PushService pushService;

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject:mailto:admin@kuraflow.com}")
    private String subject;

    public PushNotificationService(PushSubscriptionRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            pushService = new PushService(publicKey, privateKey, subject);
        } catch (Exception e) {
            log.error("Failed to initialize PushService", e);
        }
    }

    public void sendNotification(UUID userId, String payload) {
        List<PushSubscription> subscriptions = repository.findByUserId(userId);
        
        for (PushSubscription sub : subscriptions) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload
                );
                pushService.send(notification);
            } catch (Exception e) {
                log.error("Failed to send push notification to endpoint {}", sub.getEndpoint(), e);
                if (e.getMessage() != null && (e.getMessage().contains("410") || e.getMessage().contains("404"))) {
                    log.info("Removing stale subscription: {}", sub.getEndpoint());
                    repository.deleteByEndpoint(sub.getEndpoint());
                }
            }
        }
    }
}
