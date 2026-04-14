package com.kuraflow.progress.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "srs_cards", schema = "progress_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SrsCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "flashcard_id", nullable = false)
    private UUID flashcardId;

    @Column(name = "ease_factor", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal easeFactor = new BigDecimal("2.50");

    @Column(name = "interval_days")
    @Builder.Default
    private Integer intervalDays = 0;

    @Builder.Default
    private Integer repetitions = 0;

    @Column(name = "next_review")
    @Builder.Default
    private OffsetDateTime nextReview = OffsetDateTime.now();

    @Column(name = "last_reviewed")
    private OffsetDateTime lastReviewed;

    @Column(length = 15)
    @Builder.Default
    private String status = "NEW";
}
