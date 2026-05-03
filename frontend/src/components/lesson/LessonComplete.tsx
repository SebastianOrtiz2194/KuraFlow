'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import './LessonComplete.css';

interface LessonCompleteProps {
  lessonTitle: string;
  xpEarned: number;
  totalSteps: number;
  /** Quiz accuracy score 0-100 */
  score?: number;
  /** Number of quiz answers correct on first try */
  perfectAnswers?: number;
  /** Total number of quiz steps in the lesson */
  totalQuizSteps?: number;
  onRestart?: () => void;
  onExit?: () => void;
}

/**
 * Completion screen shown after the user finishes all lesson steps.
 * Features animated XP counter, score ring, and accuracy stats.
 */
export function LessonComplete({
  lessonTitle,
  xpEarned,
  totalSteps,
  score = 100,
  perfectAnswers = 0,
  totalQuizSteps = 0,
  onRestart,
  onExit,
}: LessonCompleteProps) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Delay content appearance for entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate XP counter
  useEffect(() => {
    if (!showContent) return;

    const duration = 1200;
    const steps = 30;
    const increment = xpEarned / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), xpEarned);
      setAnimatedXP(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [showContent, xpEarned]);

  // Animate score counter
  useEffect(() => {
    if (!showContent) return;

    const duration = 1400;
    const steps = 35;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setAnimatedScore(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [showContent, score]);

  // Pick a message based on score
  const getMessage = () => {
    if (score >= 90) return { emoji: '🎌', text: 'Outstanding! You nailed this lesson.' };
    if (score >= 70) return { emoji: '💪', text: 'Great effort! Keep pushing forward.' };
    if (score >= 50) return { emoji: '📖', text: 'Good try! A review could help solidify the concepts.' };
    return { emoji: '🔄', text: 'Don\'t worry! Practice makes perfect. Try again!' };
  };

  const message = getMessage();

  // Score ring stroke calculation
  const circumference = 2 * Math.PI * 44; // radius = 44
  const strokeOffset = circumference - (circumference * animatedScore) / 100;

  // Score color based on performance
  const getScoreColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="lesson-complete">
      <div className={`lesson-complete-content ${showContent ? 'lesson-complete-content--visible' : ''}`}>
        {/* Score ring */}
        <div className="complete-score-ring-wrapper">
          <svg className="complete-score-ring" width="120" height="120" viewBox="0 0 100 100">
            <circle
              className="score-ring-bg"
              cx="50" cy="50" r="44"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
            />
            <circle
              className="score-ring-fill"
              cx="50" cy="50" r="44"
              fill="none"
              stroke={getScoreColor()}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="score-ring-value">
            <span className="score-ring-number">{animatedScore}</span>
            <span className="score-ring-percent">%</span>
          </div>
        </div>

        <h1 className="complete-title">Lesson Complete!</h1>
        <p className="complete-subtitle">{lessonTitle}</p>

        {/* Stats */}
        <div className="complete-stats">
          <div className="complete-stat">
            <span className="complete-stat-value complete-stat-value--xp">
              +{animatedXP}
            </span>
            <span className="complete-stat-label">XP Earned</span>
          </div>
          <div className="complete-stat-divider" />
          <div className="complete-stat">
            <span className="complete-stat-value">{totalSteps}</span>
            <span className="complete-stat-label">Steps</span>
          </div>
          {totalQuizSteps > 0 && (
            <>
              <div className="complete-stat-divider" />
              <div className="complete-stat">
                <span className="complete-stat-value">{perfectAnswers}/{totalQuizSteps}</span>
                <span className="complete-stat-label">Perfect</span>
              </div>
            </>
          )}
        </div>

        {/* Encouraging message */}
        <div className="complete-message">
          <span className="complete-message-emoji">{message.emoji}</span>
          <p>{message.text}</p>
        </div>

        {/* Actions */}
        <div className="complete-actions">
          <Button variant="primary" size="lg" onClick={onExit} className="complete-action-btn">
            Continue Learning
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3L11 8L6 13" />
            </svg>
          </Button>
          <Button variant="outline" onClick={onRestart} className="complete-action-btn">
            Review Again
          </Button>
        </div>
      </div>

      {/* Background particles */}
      <div className="complete-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`particle particle--${i}`} />
        ))}
      </div>
    </div>
  );
}
