'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import './LessonComplete.css';

interface LessonCompleteProps {
  lessonTitle: string;
  xpEarned: number;
  totalSteps: number;
  onRestart?: () => void;
  onExit?: () => void;
}

/**
 * Completion screen shown after the user finishes all lesson steps.
 * Features animated XP counter and encouraging messaging.
 */
export function LessonComplete({
  lessonTitle,
  xpEarned,
  totalSteps,
  onRestart,
  onExit,
}: LessonCompleteProps) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Animate XP counter
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="lesson-complete">
      <div className={`lesson-complete-content ${showContent ? 'lesson-complete-content--visible' : ''}`}>
        {/* Success animation */}
        <div className="complete-icon-wrapper">
          <div className="complete-icon-ring" />
          <div className="complete-icon-check">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 25L20 35L38 13" />
            </svg>
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
            <span className="complete-stat-label">Steps Completed</span>
          </div>
          <div className="complete-stat-divider" />
          <div className="complete-stat">
            <span className="complete-stat-value">100%</span>
            <span className="complete-stat-label">Score</span>
          </div>
        </div>

        {/* Encouraging message */}
        <div className="complete-message">
          <span className="complete-message-emoji">🎌</span>
          <p>Great job! You are one step closer to mastering Japanese.</p>
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
