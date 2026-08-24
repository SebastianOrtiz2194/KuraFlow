package com.kuraflow.progress.service.impl;

import com.kuraflow.progress.dto.SrsDeckSummaryResponse;
import com.kuraflow.progress.dto.SrsReviewRequest;
import com.kuraflow.progress.dto.SrsStatsResponse;
import com.kuraflow.progress.entity.SrsCard;
import com.kuraflow.progress.repository.SrsCardRepository;
import com.kuraflow.progress.service.KafkaEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SrsServiceImplTest {

    @Mock
    private SrsCardRepository srsCardRepository;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @InjectMocks
    private SrsServiceImpl srsService;

    @Test
    @DisplayName("reviewCard: Quality >= 3 advances repetition and interval (SM-2)")
    void reviewCard_GoodQualityAdvances() {
        UUID userId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();

        SrsCard card = SrsCard.builder()
                .userId(userId)
                .flashcardId(cardId)
                .easeFactor(new BigDecimal("2.50"))
                .intervalDays(0)
                .repetitions(0)
                .build();

        when(srsCardRepository.findByUserIdAndFlashcardId(userId, cardId)).thenReturn(Optional.of(card));
        when(srsCardRepository.save(any(SrsCard.class))).thenAnswer(i -> i.getArgument(0));

        SrsReviewRequest request = new SrsReviewRequest();
        request.setQuality(5);

        SrsCard result = srsService.reviewCard(userId, cardId, request);

        assertThat(result.getRepetitions()).isEqualTo(1);
        assertThat(result.getIntervalDays()).isEqualTo(1);
        assertThat(result.getStatus()).isEqualTo("REVIEW");
        verify(kafkaEventPublisher).publishReviewCompleted(any());
    }

    @Test
    @DisplayName("reviewCard: Quality < 3 resets repetition (lapse)")
    void reviewCard_LowQualityResets() {
        UUID userId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();

        SrsCard card = SrsCard.builder()
                .userId(userId)
                .flashcardId(cardId)
                .easeFactor(new BigDecimal("2.50"))
                .intervalDays(6)
                .repetitions(2)
                .build();

        when(srsCardRepository.findByUserIdAndFlashcardId(userId, cardId)).thenReturn(Optional.of(card));
        when(srsCardRepository.save(any(SrsCard.class))).thenAnswer(i -> i.getArgument(0));

        SrsReviewRequest request = new SrsReviewRequest();
        request.setQuality(2); // lapse

        SrsCard result = srsService.reviewCard(userId, cardId, request);

        assertThat(result.getRepetitions()).isEqualTo(0);
        assertThat(result.getIntervalDays()).isEqualTo(1);
    }

    @Test
    @DisplayName("getSrsStats: Computes retention rate, stage counts, and due cards")
    void getSrsStats_CalculatesMetrics() {
        UUID userId = UUID.randomUUID();
        SrsCard c1 = SrsCard.builder()
                .userId(userId)
                .status("GRADUATED")
                .easeFactor(new BigDecimal("2.60"))
                .repetitions(5)
                .nextReview(OffsetDateTime.now().plusDays(30))
                .build();

        SrsCard c2 = SrsCard.builder()
                .userId(userId)
                .status("REVIEW")
                .easeFactor(new BigDecimal("2.40"))
                .repetitions(2)
                .nextReview(OffsetDateTime.now().minusHours(2)) // due today
                .build();

        when(srsCardRepository.findByUserId(userId)).thenReturn(List.of(c1, c2));

        SrsStatsResponse stats = srsService.getSrsStats(userId);

        assertThat(stats.getTotalCards()).isEqualTo(2);
        assertThat(stats.getGraduatedCount()).isEqualTo(1);
        assertThat(stats.getReviewCount()).isEqualTo(1);
        assertThat(stats.getDueTodayCount()).isEqualTo(1);
        assertThat(stats.getRetentionRate()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("getDeckSummary: Computes mastery percentage")
    void getDeckSummary_Success() {
        UUID userId = UUID.randomUUID();
        UUID deckId = UUID.randomUUID();

        SrsCard c1 = SrsCard.builder().userId(userId).status("GRADUATED").repetitions(4).build();
        SrsCard c2 = SrsCard.builder().userId(userId).status("LEARNING").repetitions(0).build();

        when(srsCardRepository.findByUserId(userId)).thenReturn(List.of(c1, c2));

        SrsDeckSummaryResponse summary = srsService.getDeckSummary(userId, deckId);

        assertThat(summary.getTotalCards()).isEqualTo(2);
        assertThat(summary.getGraduatedCards()).isEqualTo(1);
        assertThat(summary.getMasteryPercentage()).isEqualTo(50.0);
    }
}
