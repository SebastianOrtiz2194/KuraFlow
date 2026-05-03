'use client';

import React, { useState, useCallback } from 'react';
import { FillInTheBlankBody } from '@/lib/types';
import './Quiz.css';

interface FillInTheBlankQuizProps {
  body: FillInTheBlankBody;
  onCorrect: () => void;
  onResult?: (isCorrect: boolean) => void;
}

export function FillInTheBlankQuiz({ body, onCorrect, onResult }: FillInTheBlankQuizProps) {
  const [value, setValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animClass, setAnimClass] = useState('');

  const isCorrect = value.trim().toLowerCase() === body.correctAnswer.trim().toLowerCase();

  const triggerAnim = useCallback((correct: boolean) => {
    setAnimClass(correct ? 'answer-correct' : 'answer-incorrect');
    setTimeout(() => setAnimClass(''), 600);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setIsSubmitted(true);
    const correct = value.trim().toLowerCase() === body.correctAnswer.trim().toLowerCase();
    triggerAnim(correct);
    onResult?.(correct);
    if (correct) {
      onCorrect();
    }
  };

  // Split the sentence by "___" to render the input in between
  const parts = body.sentence.split('___');

  return (
    <div className={`quiz-container fill-blank-quiz ${animClass}`}>
      <h2 className="quiz-question">Fill in the blank</h2>
      
      <form className="quiz-sentence-area" onSubmit={handleSubmit}>
        <div className="sentence-display">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="sentence-text">{part}</span>
              {index < parts.length - 1 && (
                <input
                  type="text"
                  className={`blank-input ${isSubmitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  value={value}
                  onChange={(e) => !isSubmitted && setValue(e.target.value)}
                  disabled={isSubmitted}
                  autoFocus
                  placeholder="..."
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {!isSubmitted ? (
          <button 
            type="submit"
            className="quiz-submit-btn" 
            disabled={!value.trim()}
          >
            Check
          </button>
        ) : (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-content">
              <p className="feedback-message">
                {isCorrect ? 'Perfect!' : `The correct answer was: ${body.correctAnswer}`}
              </p>
              {body.explanation && <p className="feedback-explanation">{body.explanation}</p>}
            </div>
            {!isCorrect && (
              <button type="button" className="quiz-retry-btn" onClick={() => { setIsSubmitted(false); setValue(''); }}>
                Retry
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
