package com.kuraflow.gamification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_quests", schema = "gamification_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "quest_date", nullable = false)
    private LocalDate questDate;

    @Column(name = "quest_type", nullable = false)
    private String questType;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column(name = "target_count", nullable = false)
    @Builder.Default
    private Integer targetCount = 1;

    @Column(name = "current_count", nullable = false)
    @Builder.Default
    private Integer currentCount = 0;

    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private Integer xpReward = 20;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "is_claimed", nullable = false)
    @Builder.Default
    private Boolean isClaimed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
