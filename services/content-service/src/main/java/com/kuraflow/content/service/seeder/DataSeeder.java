package com.kuraflow.content.service.seeder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuraflow.content.dto.seed.SeedDataDto;
import com.kuraflow.content.entity.*;
import com.kuraflow.content.entity.Module;
import com.kuraflow.content.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final LanguageRepository languageRepository;
    private final LevelRepository levelRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonContentRepository lessonContentRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;
    private final ObjectMapper objectMapper;

    @Value("${kuraflow.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("classpath:seed-data/english_a1.json")
    private Resource englishA1SeedFile;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedEnabled) {
            log.info("DataSeeder is disabled. Skipping content seeding.");
            return;
        }

        log.info("Starting DataSeeder...");

        if (englishA1SeedFile.exists()) {
            try (InputStream is = englishA1SeedFile.getInputStream()) {
                SeedDataDto seedData = objectMapper.readValue(is, SeedDataDto.class);
                processSeedData(seedData);
            }
        } else {
            log.warn("Seed file not found: seed-data/english_a1.json");
        }
        
        log.info("DataSeeder finished.");
    }

    private void processSeedData(SeedDataDto dto) {
        log.info("Processing seed data for Language: {}, Level: {}", dto.getLanguageCode(), dto.getLevelCode());
        Language language = languageRepository.findByCode(dto.getLanguageCode())
                .orElseThrow(() -> new RuntimeException("Language not found: " + dto.getLanguageCode()));
                
        Level level = levelRepository.findByLanguageIdAndCode(language.getId(), dto.getLevelCode())
                .orElseThrow(() -> new RuntimeException("Level not found: " + dto.getLevelCode() + " for language: " + language.getCode()));

        if (dto.getModules() == null) return;

        for (SeedDataDto.ModuleDto mDto : dto.getModules()) {
            Module module = new Module();
            module.setLevel(level);
            module.setType(mDto.getType());
            module.setTitle(mDto.getTitle());
            module.setDescription(mDto.getDescription());
            module.setSortOrder(mDto.getSortOrder());
            module.setIconUrl(mDto.getIconUrl());
            module = moduleRepository.save(module);

            if (mDto.getLessons() != null) {
                for (SeedDataDto.LessonDto lDto : mDto.getLessons()) {
                    Lesson lesson = new Lesson();
                    lesson.setModule(module);
                    lesson.setTitle(lDto.getTitle());
                    lesson.setDescription(lDto.getDescription());
                    lesson.setSortOrder(lDto.getSortOrder());
                    lesson.setEstimatedMinutes(lDto.getEstimatedMinutes() != null ? lDto.getEstimatedMinutes() : 10);
                    lesson.setXpReward(lDto.getXpReward() != null ? lDto.getXpReward() : 10);
                    lesson = lessonRepository.save(lesson);

                    if (lDto.getContent() != null) {
                        for (SeedDataDto.LessonContentDto lcDto : lDto.getContent()) {
                            LessonContent lessonContent = new LessonContent();
                            lessonContent.setLesson(lesson);
                            lessonContent.setContentType(lcDto.getContentType());
                            lessonContent.setSortOrder(lcDto.getSortOrder());
                            lessonContent.setTitle(lcDto.getTitle());
                            lessonContent.setBody(lcDto.getBody());
                            lessonContentRepository.save(lessonContent);
                        }
                    }
                }
            }

            if (mDto.getFlashcardDecks() != null) {
                for (SeedDataDto.FlashcardDeckDto fdDto : mDto.getFlashcardDecks()) {
                    FlashcardDeck deck = new FlashcardDeck();
                    deck.setModule(module);
                    deck.setTitle(fdDto.getTitle());
                    deck.setDescription(fdDto.getDescription());
                    deck.setCardCount(fdDto.getFlashcards() != null ? fdDto.getFlashcards().size() : 0);
                    deck = flashcardDeckRepository.save(deck);

                    if (fdDto.getFlashcards() != null) {
                        for (SeedDataDto.FlashcardDto fDto : fdDto.getFlashcards()) {
                            Flashcard flashcard = new Flashcard();
                            flashcard.setDeck(deck);
                            flashcard.setFront(fDto.getFront());
                            flashcard.setBack(fDto.getBack());
                            flashcard.setTags(fDto.getTags() != null ? fDto.getTags().toArray(new String[0]) : null);
                            flashcard.setSortOrder(fDto.getSortOrder());
                            flashcardRepository.save(flashcard);
                        }
                    }
                }
            }
        }
    }
}
