'use client';

import React, { useState, useCallback } from 'react';
import { LessonDetailResponse, ExplanationBody, ExampleBody, MCQBody, FillInTheBlankBody, ReorderBody } from '@/lib/types';
import { ExplanationRenderer } from './ExplanationRenderer';
import { ExampleRenderer } from './ExampleRenderer';
import { MultipleChoiceQuiz } from '../quiz/MultipleChoiceQuiz';
import { FillInTheBlankQuiz } from '../quiz/FillInTheBlankQuiz';
import { SentenceReorderingQuiz } from '../quiz/SentenceReorderingQuiz';
import { LessonComplete } from './LessonComplete';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import './LessonPlayer.css';

interface LessonPlayerProps {
  lesson: LessonDetailResponse;
  /** Callback when user completes the lesson and navigates away */
  onExit?: () => void;
}

/**
 * Main lesson player component that orchestrates step-by-step navigation
 * through lesson content items. Handles:
 * - Sequential content rendering based on contentType
 * - Step navigation (previous/next)
 * - Progress tracking
 * - Completion screen
 */
export function LessonPlayer({ lesson, onExit }: LessonPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  const totalSteps = lesson.contents.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const currentContent = lesson.contents[currentStep];

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      // Reset canGoNext for the next step. 
      // Non-quiz steps are always "canGoNext: true" by default in our current logic
      // But we'll handle this in a useEffect or during render
      setCanGoNext(true); 
    } else {
      setIsComplete(true);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setCanGoNext(true);
    }
  }, [currentStep]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    setCanGoNext(true);
  }, []);

  const handleQuizCorrect = useCallback(() => {
    setCanGoNext(true);
  }, []);

  // Render the completion screen
  if (isComplete) {
    return (
      <LessonComplete
        lessonTitle={lesson.title}
        xpEarned={lesson.xpReward}
        totalSteps={totalSteps}
        onRestart={handleRestart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="lesson-player">
      {/* Top bar: progress + exit */}
      <header className="lesson-player-header">
        <button className="lesson-exit-btn" onClick={onExit} aria-label="Exit lesson">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        <div className="lesson-progress-wrapper">
          <ProgressBar
            value={progress}
            variant="primary"
            size="sm"
          />
        </div>

        <span className="lesson-step-counter">
          {currentStep + 1} / {totalSteps}
        </span>
      </header>

      {/* Lesson metadata */}
      <div className="lesson-meta-bar">
        <h1 className="lesson-player-title">{lesson.title}</h1>
        <div className="lesson-meta-pills">
          <span className="meta-pill">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="6" />
              <path d="M7 3.5V7L9.5 8.5" />
            </svg>
            {lesson.estimatedMinutes} min
          </span>
          <span className="meta-pill meta-pill--xp">
            +{lesson.xpReward} XP
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="lesson-content-area" key={currentStep}>
        {renderContent(currentContent, handleQuizCorrect, setCanGoNext)}
      </div>

      {/* Navigation controls */}
      <footer className="lesson-nav-footer">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="lesson-nav-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Previous
        </Button>

        <Button
          variant="primary"
          onClick={goNext}
          disabled={!canGoNext}
          className={`lesson-nav-btn lesson-nav-btn--next ${!canGoNext ? 'locked' : ''}`}
        >
          {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
          {currentStep < totalSteps - 1 && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3L11 8L6 13" />
            </svg>
          )}
          {currentStep === totalSteps - 1 && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5L6.5 12L13 4" />
            </svg>
          )}
        </Button>
      </footer>
    </div>
  );
}

/**
 * Routes each content item to its appropriate renderer based on contentType.
 */
function renderContent(
  content: LessonDetailResponse['contents'][0], 
  onCorrect: () => void,
  setCanGoNext: (can: boolean) => void
) {
  switch (content.contentType) {
    case 'EXPLANATION':
      return (
        <ExplanationRenderer
          title={content.title}
          body={content.body as ExplanationBody}
        />
      );
    case 'EXAMPLE':
      return (
        <ExampleRenderer
          title={content.title}
          body={content.body as ExampleBody}
        />
      );
    case 'QUIZ_MCQ':
      // Quizzes start locked
      setTimeout(() => setCanGoNext(false), 0);
      return (
        <MultipleChoiceQuiz
          body={content.body as MCQBody}
          onCorrect={onCorrect}
        />
      );
    case 'QUIZ_FILLBLANK':
      setTimeout(() => setCanGoNext(false), 0);
      return (
        <FillInTheBlankQuiz
          body={content.body as FillInTheBlankBody}
          onCorrect={onCorrect}
        />
      );
    case 'QUIZ_REORDER':
      setTimeout(() => setCanGoNext(false), 0);
      return (
        <SentenceReorderingQuiz
          body={content.body as ReorderBody}
          onCorrect={onCorrect}
        />
      );
    default:
      return (
        <div className="unsupported-content">
          <p>Content type &quot;{content.contentType}&quot; is not yet supported.</p>
        </div>
      );
  }
}
