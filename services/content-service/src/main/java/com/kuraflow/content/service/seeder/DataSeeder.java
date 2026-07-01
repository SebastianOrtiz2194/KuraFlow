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
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedEnabled) {
            log.info("DataSeeder is disabled. Skipping content seeding.");
            return;
        }

        log.info("Starting DataSeeder...");

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] seedFiles = resolver.getResources("classpath:seed-data/*.json");

        if (seedFiles.length == 0) {
            log.warn("No seed files found in classpath:seed-data/");
            return;
        }

        log.info("Found {} seed file(s) to process.", seedFiles.length);

        for (Resource seedFile : seedFiles) {
            String filename = seedFile.getFilename();
            log.info("Processing seed file: {}", filename);

            try (InputStream is = seedFile.getInputStream()) {
                SeedDataDto seedData = objectMapper.readValue(is, SeedDataDto.class);

                if (isAlreadySeeded(seedData)) {
                    log.info("Skipping {} — data already exists for {}/{}", filename, seedData.getLanguageCode(), seedData.getLevelCode());
                    continue;
                }

                processSeedData(seedData);
                log.info("Successfully seeded data from: {}", filename);
            } catch (Exception e) {
                log.error("Failed to process seed file: {}", filename, e);
            }
        }

        log.info("DataSeeder finished.");
    }

    private boolean isAlreadySeeded(SeedDataDto dto) {
        Language language = languageRepository.findByCode(dto.getLanguageCode()).orElse(null);
        if (language == null) return false;

        Level level = levelRepository.findByLanguageIdAndCode(language.getId(), dto.getLevelCode()).orElse(null);
        if (level == null) return false;

        return moduleRepository.existsByLevelId(level.getId());
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
