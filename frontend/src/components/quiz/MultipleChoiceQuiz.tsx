'use client';

import React, { useState } from 'react';
import { MCQBody } from '@/lib/types';
import './Quiz.css';

interface MultipleChoiceQuizProps {
  body: MCQBody;
  onCorrect: () => void;
}

export function MultipleChoiceQuiz({ body, onCorrect }: MultipleChoiceQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selected === body.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setIsSubmitted(true);
    if (selected === body.correctIndex) {
      onCorrect();
    }
  };

  return (
    <div className="quiz-container mcq-quiz">
      <h2 className="quiz-question">{body.question}</h2>
      
      <div className="quiz-options">
        {body.options.map((option, index) => {
          const isSelected = selected === index;
          const isOptionCorrect = index === body.correctIndex;
          
          let optionClass = 'quiz-option';
          if (isSelected) optionClass += ' selected';
          if (isSubmitted) {
            if (isOptionCorrect) optionClass += ' correct';
            else if (isSelected) optionClass += ' incorrect';
          }

          return (
            <button
              key={index}
              className={optionClass}
              onClick={() => !isSubmitted && setSelected(index)}
              disabled={isSubmitted}
            >
              <span className="option-indicator">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button 
          className="quiz-submit-btn" 
          onClick={handleSubmit}
          disabled={selected === null}
        >
          Check
        </button>
      ) : (
        <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <p className="feedback-message">
              {isCorrect ? 'Excellent! That is correct.' : 'Not quite. Try again!'}
            </p>
            {body.explanation && <p className="feedback-explanation">{body.explanation}</p>}
          </div>
          {!isCorrect && (
            <button className="quiz-retry-btn" onClick={() => { setIsSubmitted(false); setSelected(null); }}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
