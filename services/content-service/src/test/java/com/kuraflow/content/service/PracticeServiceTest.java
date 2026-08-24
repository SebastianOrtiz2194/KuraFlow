package com.kuraflow.content.service;

import com.kuraflow.content.dto.practice.PracticeQuizResponse;
import com.kuraflow.content.entity.Flashcard;
import com.kuraflow.content.entity.FlashcardDeck;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.LessonContent;
import com.kuraflow.content.repository.FlashcardRepository;
import com.kuraflow.content.repository.LessonContentRepository;
import com.kuraflow.content.repository.LessonRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PracticeServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonContentRepository lessonContentRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @InjectMocks
    private PracticeService practiceService;

    @Test
    @DisplayName("generateQuickQuiz: Generates practice quiz from lesson quiz items and flashcards")
    void generateQuickQuiz_Success() {
        UUID levelId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        Lesson lesson = Lesson.builder().id(lessonId).title("Verbs").build();

        LessonContent content = LessonContent.builder()
                .id(UUID.randomUUID())
                .lesson(lesson)
                .contentType("QUIZ_MCQ")
                .sortOrder(1)
                .title("Choose correct verb")
                .body(Map.of(
                        "question", "They ___ coffee.",
                        "options", List.of("drink", "drinks", "drinking"),
                        "correct", 0,
                        "explanation", "Plural subject takes base form."
                ))
                .build();

        FlashcardDeck deck = FlashcardDeck.builder().id(UUID.randomUUID()).build();
        Flashcard flashcard = Flashcard.builder()
                .id(UUID.randomUUID())
                .deck(deck)
                .front(Map.of("word", "taberu", "kanji", "食べる"))
                .back(Map.of("meaning", "to eat"))
                .tags(new String[]{"verb", "N5"})
                .build();

        when(lessonRepository.findByModule_Level_Id(levelId)).thenReturn(List.of(lesson));
        when(lessonContentRepository.findByLessonIdOrderBySortOrderAsc(lessonId)).thenReturn(List.of(content));
        when(flashcardRepository.findAll()).thenReturn(List.of(flashcard));

        PracticeQuizResponse response = practiceService.generateQuickQuiz(levelId, null, 10);

        assertThat(response).isNotNull();
        assertThat(response.getQuestions()).isNotEmpty();
        assertThat(response.getTotalXpReward()).isGreaterThan(0);
    }
}
