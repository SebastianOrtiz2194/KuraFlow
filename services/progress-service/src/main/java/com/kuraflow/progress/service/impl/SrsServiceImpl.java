package com.kuraflow.progress.service.impl;

import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.service.KafkaEventPublisher;
import com.kuraflow.progress.service.SrsService;
import com.kuraflow.shared.events.ReviewCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SrsServiceImpl implements SrsService {

    private final SrsCardRepository srsCardRepository;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Override
    @Transactional
    public SrsCard reviewCard(UUID userId, UUID flashcardId, SrsReviewRequest request) {
        SrsCard card = srsCardRepository.findByUserIdAndFlashcardId(userId, flashcardId)
                .orElse(SrsCard.builder()
                        .userId(userId)
                        .flashcardId(flashcardId)
                        .easeFactor(new BigDecimal("2.50"))
                        .intervalDays(0)
                        .repetitions(0)
                        .build());

        int quality = request.getQuality();
        int repetitions = card.getRepetitions();
        BigDecimal easeFactor = card.getEaseFactor();
        int intervalDays = card.getIntervalDays();

        if (quality >= 3) {
            if (repetitions == 0) {
                intervalDays = 1;
            } else if (repetitions == 1) {
                intervalDays = 6;
            } else {
                intervalDays = (int) Math.round(intervalDays * easeFactor.doubleValue());
            }
            repetitions++;
        } else {
            repetitions = 0;
            intervalDays = 1;
        }

        double easeFactorValue = easeFactor.doubleValue() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactorValue < 1.3) {
            easeFactorValue = 1.3;
        }
        
        card.setRepetitions(repetitions);
        card.setIntervalDays(intervalDays);
        card.setEaseFactor(BigDecimal.valueOf(easeFactorValue).setScale(2, RoundingMode.HALF_UP));
        
        card.setLastReviewed(OffsetDateTime.now());
        card.setNextReview(OffsetDateTime.now().plusDays(intervalDays));
        
        if (intervalDays > 21) {
            card.setStatus("GRADUATED");
        } else if (intervalDays > 0) {
            card.setStatus("REVIEW");
        } else {
            card.setStatus("LEARNING");
        }

        SrsCard savedCard = srsCardRepository.save(card);

        // Publish event
        kafkaEventPublisher.publishReviewCompleted(ReviewCompletedEvent.builder()
                .userId(userId)
                .cardId(flashcardId)
                .quality(quality)
                .timestamp(savedCard.getLastReviewed().toInstant())
                .build());

        return savedCard;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SrsCard> getDueCards(UUID userId) {
        return srsCardRepository.findByUserIdAndNextReviewBeforeAndStatusNot(userId, OffsetDateTime.now(), "GRADUATED");
    }
}
