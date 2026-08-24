package com.kuraflow.progress.service.impl;

import com.kuraflow.progress.dto.SrsDeckSummaryResponse;
import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.dto.SrsStatsResponse;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.repository.SrsCardRepository;
import com.kuraflow.progress.service.KafkaEventPublisher;
import com.kuraflow.progress.service.SrsService;
import com.kuraflow.shared.events.ReviewCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Override
    @Transactional(readOnly = true)
    public SrsStatsResponse getSrsStats(UUID userId) {
        List<SrsCard> cards = srsCardRepository.findByUserId(userId);
        long totalCards = cards.size();

        long learningCount = 0;
        long reviewCount = 0;
        long graduatedCount = 0;
        int totalRepetitions = 0;
        double sumEaseFactor = 0.0;
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime tomorrow = now.plusDays(1);
        long dueToday = 0;
        long dueTomorrow = 0;

        for (SrsCard card : cards) {
            totalRepetitions += card.getRepetitions();
            sumEaseFactor += card.getEaseFactor().doubleValue();

            if ("GRADUATED".equalsIgnoreCase(card.getStatus())) {
                graduatedCount++;
            } else if ("REVIEW".equalsIgnoreCase(card.getStatus())) {
                reviewCount++;
            } else {
                learningCount++;
            }

            if (card.getNextReview() != null) {
                if (card.getNextReview().isBefore(now)) {
                    dueToday++;
                } else if (card.getNextReview().isBefore(tomorrow)) {
                    dueTomorrow++;
                }
            }
        }

        double averageEaseFactor = totalCards > 0 ? (sumEaseFactor / totalCards) : 2.50;
        double retentionRate = totalCards > 0 ? ((double) graduatedCount / totalCards) * 100.0 : 0.0;

        Map<String, Long> distribution = new HashMap<>();
        distribution.put("LEARNING", learningCount);
        distribution.put("REVIEW", reviewCount);
        distribution.put("GRADUATED", graduatedCount);

        return SrsStatsResponse.builder()
                .totalCards(totalCards)
                .learningCount(learningCount)
                .reviewCount(reviewCount)
                .graduatedCount(graduatedCount)
                .dueTodayCount(dueToday)
                .dueTomorrowCount(dueTomorrow)
                .retentionRate(Math.round(retentionRate * 10.0) / 10.0)
                .averageEaseFactor(Math.round(averageEaseFactor * 100.0) / 100.0)
                .totalRepetitions(totalRepetitions)
                .statusDistribution(distribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SrsDeckSummaryResponse getDeckSummary(UUID userId, UUID deckId) {
        List<SrsCard> cards = srsCardRepository.findByUserId(userId);
        long totalCards = cards.size();
        long reviewedCards = cards.stream().filter(c -> c.getRepetitions() > 0).count();
        long graduatedCards = cards.stream().filter(c -> "GRADUATED".equalsIgnoreCase(c.getStatus())).count();
        double mastery = totalCards > 0 ? ((double) graduatedCards / totalCards) * 100.0 : 0.0;
        long dueCards = cards.stream().filter(c -> c.getNextReview() != null && c.getNextReview().isBefore(OffsetDateTime.now())).count();

        return SrsDeckSummaryResponse.builder()
                .deckId(deckId)
                .totalCards(totalCards)
                .reviewedCards(reviewedCards)
                .graduatedCards(graduatedCards)
                .masteryPercentage(Math.round(mastery * 10.0) / 10.0)
                .dueCards(dueCards)
                .build();
    }
}
