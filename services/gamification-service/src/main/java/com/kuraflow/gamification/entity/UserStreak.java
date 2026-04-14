package com.kuraflow.gamification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_streaks", schema = "gamification_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "current_streak")
    private Integer currentStreak;

    @Column(name = "longest_streak")
    private Integer longest_streak;

    @Column(name = "last_activity")
    private LocalDate lastActivity;

    @Column(name = "streak_freezes")
    private Integer streakFreezes;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
