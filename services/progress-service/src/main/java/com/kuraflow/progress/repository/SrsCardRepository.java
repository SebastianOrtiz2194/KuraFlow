package com.kuraflow.progress.repository;

import com.kuraflow.progress.entity.SrsCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SrsCardRepository extends JpaRepository<SrsCard, UUID> {
    List<SrsCard> findByUserIdAndNextReviewBeforeAndStatusNot(UUID userId, OffsetDateTime nextReview, String status);
}
