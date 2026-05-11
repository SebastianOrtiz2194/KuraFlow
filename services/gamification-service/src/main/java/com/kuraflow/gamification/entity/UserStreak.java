package com.kuraflow.gamification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

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
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak")
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_activity")
    private LocalDate lastActivity;

    @Column(name = "streak_freezes")
    @Builder.Default
    private Integer streakFreezes = 0;

    @Column(name = "total_xp")
    @Builder.Default
    private Integer totalXp = 0;

    @Column(name = "total_lessons_completed")
    @Builder.Default
    private Integer totalLessonsCompleted = 0;

    @Column(name = "total_perfect_scores")
    @Builder.Default
    private Integer totalPerfectScores = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
