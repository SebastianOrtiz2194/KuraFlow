import React, { useState } from 'react';
import { FlashcardResponse } from '@/lib/types';
import './Flashcard.css';

interface FlashcardProps {
  card: FlashcardResponse;
  onReview: (quality: number) => void;
}

export function Flashcard({ card, onReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleRate = (quality: number) => {
    setIsFlipped(false);
    onReview(quality);
  };

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={!isFlipped ? handleFlip : undefined}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            {card.front.reading && <div className="flashcard-reading">{card.front.reading}</div>}
            <div className="flashcard-text">{card.front.text}</div>
            {!isFlipped && (
              <div className="flashcard-hint">Tap to reveal answer</div>
            )}
          </div>
          
          <div className="flashcard-back">
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

      {isFlipped && (
        <div className="flashcard-actions">
          <button className="btn-rate again" onClick={() => handleRate(1)}>
            <span className="rate-label">Again</span>
            <span className="rate-desc">&lt; 1m</span>
          </button>
          <button className="btn-rate hard" onClick={() => handleRate(3)}>
            <span className="rate-label">Hard</span>
            <span className="rate-desc">~6d</span>
          </button>
          <button className="btn-rate good" onClick={() => handleRate(4)}>
            <span className="rate-label">Good</span>
            <span className="rate-desc">~10d</span>
          </button>
          <button className="btn-rate easy" onClick={() => handleRate(5)}>
            <span className="rate-label">Easy</span>
            <span className="rate-desc">~14d</span>
          </button>
        </div>
      )}
    </div>
  );
}
