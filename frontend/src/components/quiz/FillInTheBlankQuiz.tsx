'use client';

import React, { useState } from 'react';
import { FillInTheBlankBody } from '@/lib/types';
import './Quiz.css';

interface FillInTheBlankQuizProps {
  body: FillInTheBlankBody;
  onCorrect: () => void;
}

export function FillInTheBlankQuiz({ body, onCorrect }: FillInTheBlankQuizProps) {
  const [value, setValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = value.trim().toLowerCase() === body.correctAnswer.trim().toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setIsSubmitted(true);
    if (isCorrect) {
      onCorrect();
    }
  };

  // Split the sentence by "___" to render the input in between
  const parts = body.sentence.split('___');

  return (
    <div className="quiz-container fill-blank-quiz">
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
