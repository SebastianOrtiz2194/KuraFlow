'use client';

import { useState, useCallback, useMemo } from 'react';

export interface QuizAttempt {
  stepIndex: number;
  contentType: string;
  isCorrect: boolean;
  attempts: number;
  timestamp: number;
}

export interface QuizScoreState {
  /** All quiz attempts (one per quiz step, updated on each submission) */
  attempts: QuizAttempt[];
  /** Number of quiz steps answered correctly on the first try */
  perfectAnswers: number;
  /** Total number of quiz steps encountered */
  totalQuizSteps: number;
  /** Score as a percentage (0-100). Penalizes retries: first try = 100%, second = 50%, third+ = 25% */
  score: number;
  /** Total XP earned from quizzes (score-weighted portion of lesson XP) */
  earnedXP: number;
}

/**
 * Hook to track real-time quiz scores throughout a lesson.
 * Each quiz step contributes equally to the total score.
 * Retries reduce the score for that step: 1st attempt = 100%, 2nd = 50%, 3rd+ = 25%.
 */
export function useQuizScore(lessonXP: number) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [retryCounters, setRetryCounters] = useState<Record<number, number>>({});

  const recordAttempt = useCallback((stepIndex: number, contentType: string, isCorrect: boolean) => {
    setRetryCounters((prev) => {
      const current = prev[stepIndex] ?? 0;
      return { ...prev, [stepIndex]: current + 1 };
    });

    setAttempts((prev) => {
      const existing = prev.findIndex((a) => a.stepIndex === stepIndex);
      const attemptCount = (retryCounters[stepIndex] ?? 0) + 1;
      const entry: QuizAttempt = {
        stepIndex,
        contentType,
        isCorrect,
        attempts: attemptCount,
        timestamp: Date.now(),
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  }, [retryCounters]);

  const state = useMemo<QuizScoreState>(() => {
    const correctAttempts = attempts.filter((a) => a.isCorrect);
    const totalQuizSteps = attempts.length;
    const perfectAnswers = correctAttempts.filter((a) => a.attempts === 1).length;

    // Score calculation: each quiz step contributes equally
    let totalWeight = 0;
    for (const attempt of attempts) {
      if (attempt.isCorrect) {
        if (attempt.attempts === 1) totalWeight += 1.0;
        else if (attempt.attempts === 2) totalWeight += 0.5;
        else totalWeight += 0.25;
      }
      // Incorrect (not yet solved) contributes 0
    }

    const score = totalQuizSteps > 0 ? Math.round((totalWeight / totalQuizSteps) * 100) : 100;
    const earnedXP = Math.round(lessonXP * (score / 100));

    return {
      attempts,
      perfectAnswers,
      totalQuizSteps,
      score,
      earnedXP,
    };
  }, [attempts, lessonXP]);

  const reset = useCallback(() => {
    setAttempts([]);
    setRetryCounters({});
  }, []);

  return { ...state, recordAttempt, reset };
}
