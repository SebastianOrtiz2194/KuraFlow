'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardResponse } from '@/lib/types';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { sounds } from '@/lib/soundEffects';
import './Flashcard.css';

interface FlashcardProps {
  card: FlashcardResponse;
  onReview: (quality: number) => void;
}

export function Flashcard({ card, onReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const [prevCardId, setPrevCardId] = useState(card.id);
  if (card.id !== prevCardId) {
    setPrevCardId(card.id);
    setIsFlipped(false);
  }

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped(true);
  }, []);

  const handleRate = useCallback(
    (quality: number) => {
      if (quality >= 4) {
        sounds.playCorrect();
      } else {
        sounds.playIncorrect();
      }
      setIsFlipped(false);
      onReview(quality);
    },
    [onReview]
  );

  // Keyboard navigation: Space to flip, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!isFlipped) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          handleFlip();
        }
      } else {
        if (e.key === '1') {
          e.preventDefault();
          handleRate(1);
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate(3);
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate(4);
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate(5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleRate]);

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={!isFlipped ? handleFlip : undefined}
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Click or press space to flip."
        onKeyDown={(e) => {
          if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <div className="flashcard-inner">
          {/* Card Front */}
          <div className="flashcard-front">
            <div className="flashcard-audio-wrap" onClick={(e) => e.stopPropagation()}>
              <AudioPlayer
                src={card.front.audioUrl}
                text={card.front.reading || card.front.text}
                compact
              />
            </div>
            {card.front.reading && (
              <div className="flashcard-reading">{card.front.reading}</div>
            )}
            <div className="flashcard-text">{card.front.text}</div>
            {!isFlipped && (
              <div className="flashcard-hint">
                <span>Tap or press</span> <kbd className="kbd-shortcut">Space</kbd> <span>to reveal</span>
              </div>
            )}
          </div>

          {/* Card Back */}
          <div className="flashcard-back">
            <div className="flashcard-audio-wrap" onClick={(e) => e.stopPropagation()}>
              <AudioPlayer
                text={card.back.text}
                compact
              />
            </div>
            <div className="flashcard-text-back">{card.back.text}</div>
            {card.back.example && (
              <div className="flashcard-example">
                <strong>Example:</strong> {card.back.example}
              </div>
            )}
            {card.back.notes && (
              <div className="flashcard-notes">
                <strong>Notes:</strong> {card.back.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Rating Actions */}
      {isFlipped && (
        <div className="flashcard-actions">
          <button className="btn-rate again" onClick={() => handleRate(1)}>
            <div className="rate-btn-top">
              <span className="rate-label">Again</span>
              <kbd className="rate-kbd">1</kbd>
            </div>
            <span className="rate-desc">&lt; 1m</span>
          </button>

          <button className="btn-rate hard" onClick={() => handleRate(3)}>
            <div className="rate-btn-top">
              <span className="rate-label">Hard</span>
              <kbd className="rate-kbd">2</kbd>
            </div>
            <span className="rate-desc">~6d</span>
          </button>

          <button className="btn-rate good" onClick={() => handleRate(4)}>
            <div className="rate-btn-top">
              <span className="rate-label">Good</span>
              <kbd className="rate-kbd">3</kbd>
            </div>
            <span className="rate-desc">~10d</span>
          </button>

          <button className="btn-rate easy" onClick={() => handleRate(5)}>
            <div className="rate-btn-top">
              <span className="rate-label">Easy</span>
              <kbd className="rate-kbd">4</kbd>
            </div>
            <span className="rate-desc">~14d</span>
          </button>
        </div>
      )}
    </div>
  );
}
