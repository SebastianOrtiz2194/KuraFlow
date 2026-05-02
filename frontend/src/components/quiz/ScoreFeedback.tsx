'use client';

import React, { useEffect, useState } from 'react';
import './ScoreFeedback.css';

interface XPToastProps {
  xpAmount: number;
  visible: boolean;
}

/**
 * Floating XP toast that appears on correct answers.
 * Animates upward and fades out.
 */
export function XPToast({ xpAmount, visible }: XPToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      window.requestAnimationFrame(() => setShow(true));
      const timer = setTimeout(() => setShow(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="xp-toast" aria-live="polite">
      <span className="xp-toast-icon">+{xpAmount}</span>
      <span className="xp-toast-label">XP</span>
    </div>
  );
}

interface ConfettiBurstProps {
  active: boolean;
}

// Pre-computed confetti positions to avoid Math.random() during render
const CONFETTI_PIECES = Array.from({ length: 20 }, (_, i) => ({
  left: `${10 + ((i * 17 + 7) % 80)}%`,
  animationDelay: `${((i * 13 + 3) % 30) / 100}s`,
  animationDuration: `${0.8 + ((i * 7 + 11) % 60) / 100}s`,
  variant: i % 5,
}));

/**
 * CSS-only confetti burst overlay triggered on correct quiz answers.
 */
export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      window.requestAnimationFrame(() => setShow(true));
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!show) return null;

  return (
    <div className="confetti-burst" aria-hidden="true">
      {CONFETTI_PIECES.map((piece, i) => (
        <span key={i} className={`confetti-piece confetti-piece--${piece.variant}`} style={{
          left: piece.left,
          animationDelay: piece.animationDelay,
          animationDuration: piece.animationDuration,
        }} />
      ))}
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  correctCount: number;
  totalQuizSteps: number;
}

/**
 * Inline animated score bar displayed in the lesson header during quiz steps.
 */
export function ScoreBar({ score, correctCount, totalQuizSteps }: ScoreBarProps) {
  if (totalQuizSteps === 0) return null;

  return (
    <div className="score-bar">
      <div className="score-bar-fill" style={{ width: `${score}%` }} />
      <span className="score-bar-text">
        {correctCount}/{totalQuizSteps} correct &middot; {score}%
      </span>
    </div>
  );
}

interface StreakIndicatorProps {
  streak: number;
}

/**
 * Shows current correct-answer streak with animated fire effect.
 */
export function StreakIndicator({ streak }: StreakIndicatorProps) {
  if (streak < 2) return null;

  return (
    <div className={`streak-indicator ${streak >= 5 ? 'streak--fire' : ''}`}>
      <span className="streak-flame">&#x1F525;</span>
      <span className="streak-count">{streak} streak</span>
    </div>
  );
}
