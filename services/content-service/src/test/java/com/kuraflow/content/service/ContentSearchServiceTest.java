package com.kuraflow.content.service;

import com.kuraflow.content.dto.search.ContentSearchResultDto;
import com.kuraflow.content.entity.Flashcard;
import com.kuraflow.content.entity.FlashcardDeck;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.Module;
import com.kuraflow.content.repository.FlashcardRepository;
import com.kuraflow.content.repository.LessonRepository;
import com.kuraflow.content.repository.ModuleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentSearchServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @InjectMocks
    private ContentSearchService searchService;

    @Test
    @DisplayName("search: Returns lessons, modules, and flashcards matching query")
    void search_Success() {
        Lesson lesson = Lesson.builder()
                .id(UUID.randomUUID())
                .title("Grammar Lesson")
                .description("Present tense")
                .xpReward(20)
                .estimatedMinutes(10)
                .build();

        Module module = Module.builder()
                .id(UUID.randomUUID())
                .title("Grammar Module")
                .description("All grammar")
                .type("GRAMMAR")
                .build();

        Flashcard flashcard = Flashcard.builder()
                .id(UUID.randomUUID())
                .deck(FlashcardDeck.builder().id(UUID.randomUUID()).build())
                .tags(new String[]{"grammar"})
                .back(Map.of("meaning", "rule"))
                .build();

        when(lessonRepository.findByTitleContainingIgnoreCase("grammar")).thenReturn(List.of(lesson));
        when(moduleRepository.findByTitleContainingIgnoreCase("grammar")).thenReturn(List.of(module));
        when(flashcardRepository.findByTag(eq("grammar"), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(flashcard)));

        List<ContentSearchResultDto> results = searchService.search("grammar");

        assertThat(results).hasSize(3);
        assertThat(results.stream().map(ContentSearchResultDto::getType)).contains("LESSON", "MODULE", "FLASHCARD");
    }

    @Test
    @DisplayName("search: Returns empty list for blank query")
    void search_EmptyQuery() {
        List<ContentSearchResultDto> results = searchService.search("   ");
        assertThat(results).isEmpty();
    }
}
