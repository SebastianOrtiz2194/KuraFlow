package com.kuraflow.content.service;

import com.kuraflow.content.dto.practice.PracticeQuestionDto;
import com.kuraflow.content.dto.practice.PracticeQuizResponse;
import com.kuraflow.content.entity.Flashcard;
import com.kuraflow.content.entity.Lesson;
import com.kuraflow.content.entity.LessonContent;
import com.kuraflow.content.repository.FlashcardRepository;
import com.kuraflow.content.repository.LessonContentRepository;
import com.kuraflow.content.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticeService {

    private final LessonRepository lessonRepository;
    private final LessonContentRepository lessonContentRepository;
    private final FlashcardRepository flashcardRepository;

    @Transactional(readOnly = true)
    public PracticeQuizResponse generateQuickQuiz(UUID levelId, UUID moduleId, int limit) {
        int maxQuestions = Math.min(Math.max(limit, 5), 25);
        List<PracticeQuestionDto> questions = new ArrayList<>();

        // 1. Gather lesson quiz items
        List<Lesson> lessons;
        if (moduleId != null) {
            lessons = lessonRepository.findByModuleId(moduleId);
        } else if (levelId != null) {
            lessons = lessonRepository.findByModule_Level_Id(levelId);
        } else {
            lessons = lessonRepository.findAll();
        }

        for (Lesson lesson : lessons) {
            List<LessonContent> contents = lessonContentRepository.findByLessonIdOrderBySortOrderAsc(lesson.getId());
            for (LessonContent content : contents) {
                if (content.getContentType() != null && content.getContentType().startsWith("QUIZ")) {
                    PracticeQuestionDto questionDto = parseQuizContent(content);
                    if (questionDto != null) {
                        questions.add(questionDto);
                    }
                }
            }
        }

        // 2. Supplement with Flashcard-generated questions if needed
        if (questions.size() < maxQuestions) {
            List<Flashcard> flashcards = flashcardRepository.findAll();
            Collections.shuffle(flashcards);

            for (Flashcard card : flashcards) {
                if (questions.size() >= maxQuestions * 2) break;
                PracticeQuestionDto cardQuestion = convertFlashcardToQuestion(card, flashcards);
                if (cardQuestion != null) {
                    questions.add(cardQuestion);
                }
            }
        }

        // Shuffle and limit
        Collections.shuffle(questions);
        List<PracticeQuestionDto> selected = questions.stream().limit(maxQuestions).toList();

        int totalXp = selected.size() * 5; // 5 XP per practice question

        return PracticeQuizResponse.builder()
                .title("Dynamic Quick Practice")
                .levelId(levelId)
                .moduleId(moduleId)
                .totalQuestions(selected.size())
                .estimatedMinutes(Math.max(1, selected.size() / 2))
                .totalXpReward(totalXp)
                .questions(selected)
                .build();
    }

    private PracticeQuestionDto parseQuizContent(LessonContent content) {
        Map<String, Object> body = content.getBody();
        if (body == null) return null;

        String question = (String) body.get("question");
        if (question == null) {
            question = content.getTitle();
        }

        List<?> optionsRaw = (List<?>) body.get("options");
        List<String> options = new ArrayList<>();
        if (optionsRaw != null) {
            for (Object opt : optionsRaw) {
                options.add(String.valueOf(opt));
            }
        }

        Object correctObj = body.get("correct");
        String correctAnswer = "";
        if (correctObj instanceof Number num && !options.isEmpty()) {
            int idx = num.intValue();
            if (idx >= 0 && idx < options.size()) {
                correctAnswer = options.get(idx);
            }
        } else if (correctObj instanceof String str) {
            correctAnswer = str;
        }

        String explanation = (String) body.get("explanation");

        return PracticeQuestionDto.builder()
                .id(content.getId())
                .type("MULTIPLE_CHOICE")
                .prompt(question)
                .options(options)
                .correctAnswer(correctAnswer)
                .explanation(explanation)
                .sourceId(content.getLesson().getId())
                .xpReward(5)
                .build();
    }

    private PracticeQuestionDto convertFlashcardToQuestion(Flashcard targetCard, List<Flashcard> allCards) {
        Map<String, Object> front = targetCard.getFront();
        Map<String, Object> back = targetCard.getBack();
        if (front == null || back == null) return null;

        String prompt = extractText(front);
        String correct = extractText(back);
        if (prompt.isEmpty() || correct.isEmpty()) return null;

        Set<String> optionsSet = new LinkedHashSet<>();
        optionsSet.add(correct);

        for (Flashcard other : allCards) {
            if (!other.getId().equals(targetCard.getId()) && other.getBack() != null) {
                String distractor = extractText(other.getBack());
                if (!distractor.isEmpty() && !distractor.equalsIgnoreCase(correct)) {
                    optionsSet.add(distractor);
                }
            }
            if (optionsSet.size() >= 4) break;
        }

        List<String> options = new ArrayList<>(optionsSet);
        Collections.shuffle(options);

        return PracticeQuestionDto.builder()
                .id(targetCard.getId())
                .type("FLASHCARD_PROMPT")
                .prompt("What is the meaning of: \"" + prompt + "\"?")
                .options(options)
                .correctAnswer(correct)
                .explanation("Flashcard Review: " + prompt + " = " + correct)
                .sourceId(targetCard.getDeck().getId())
                .xpReward(5)
                .build();
    }

    private String extractText(Map<String, Object> map) {
        for (String key : List.of("meaning", "translation", "english", "text", "word", "phrase", "kanji", "front", "back")) {
            if (map.containsKey(key)) {
                return String.valueOf(map.get(key));
            }
        }
        if (!map.isEmpty()) {
            return String.valueOf(map.values().iterator().next());
        }
        return "";
    }
}
