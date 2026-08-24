package com.kuraflow.content.service;

import com.kuraflow.content.dto.search.ContentSearchResultDto;
import com.kuraflow.content.entity.Flashcard;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.Module;
import com.kuraflow.content.repository.FlashcardRepository;
import com.kuraflow.content.repository.LessonRepository;
import com.kuraflow.content.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentSearchService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final FlashcardRepository flashcardRepository;

    @Transactional(readOnly = true)
    public List<ContentSearchResultDto> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String q = query.trim();
        List<ContentSearchResultDto> results = new ArrayList<>();

        // 1. Lessons
        List<Lesson> lessons = lessonRepository.findByTitleContainingIgnoreCase(q);
        for (Lesson lesson : lessons) {
            results.add(ContentSearchResultDto.builder()
                    .id(lesson.getId())
                    .type("LESSON")
                    .title(lesson.getTitle())
                    .description(lesson.getDescription())
                    .parentId(lesson.getModule() != null ? lesson.getModule().getId() : null)
                    .extraInfo(lesson.getXpReward() + " XP • " + lesson.getEstimatedMinutes() + " min")
                    .build());
        }

        // 2. Modules
        List<Module> modules = moduleRepository.findByTitleContainingIgnoreCase(q);
        for (Module module : modules) {
            results.add(ContentSearchResultDto.builder()
                    .id(module.getId())
                    .type("MODULE")
                    .title(module.getTitle())
                    .description(module.getDescription())
                    .parentId(module.getLevel() != null ? module.getLevel().getId() : null)
                    .extraInfo(module.getType())
                    .build());
        }

        // 3. Flashcards by tag
        try {
            org.springframework.data.domain.Page<Flashcard> flashcards = flashcardRepository.findByTag(q.toLowerCase(), org.springframework.data.domain.PageRequest.of(0, 10));
            for (Flashcard card : flashcards) {
                results.add(ContentSearchResultDto.builder()
                        .id(card.getId())
                        .type("FLASHCARD")
                        .title("Flashcard: " + (card.getTags() != null && card.getTags().length > 0 ? card.getTags()[0] : "Vocab"))
                        .description(card.getBack() != null ? card.getBack().toString() : "")
                        .parentId(card.getDeck() != null ? card.getDeck().getId() : null)
                        .extraInfo("Tag: " + q)
                        .build());
            }
        } catch (Exception ignored) {
        }

        return results;
    }
}
