package com.kuraflow.progress.repository;

import com.kuraflow.progress.entity.SrsCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SrsCardRepository extends JpaRepository<SrsCard, UUID> {
    List<SrsCard> findByUserIdAndNextReviewBeforeAndStatusNot(UUID userId, OffsetDateTime nextReview, String status);

    Optional<SrsCard> findByUserIdAndFlashcardId(UUID userId, UUID flashcardId);

    List<SrsCard> findByUserId(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, String status);

    long countByUserIdAndNextReviewBefore(UUID userId, OffsetDateTime nextReview);

    long countByUserIdAndNextReviewBetween(UUID userId, OffsetDateTime start, OffsetDateTime end);
}
