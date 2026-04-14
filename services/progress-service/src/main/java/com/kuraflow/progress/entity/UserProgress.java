package com.kuraflow.progress.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_progress", schema = "progress_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(length = 20)
    private String status;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    private Integer attempts;

    @Column(name = "xp_earned")
    private Integer xpEarned;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @UpdateTimestamp
    @Column(name = "last_accessed")
    private OffsetDateTime lastAccessed;
}
