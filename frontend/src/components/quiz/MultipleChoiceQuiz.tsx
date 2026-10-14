'use client';

import React, { useState, useCallback } from 'react';
import { MCQBody } from '@/lib/types';
import './Quiz.css';

interface MultipleChoiceQuizProps {
  body: MCQBody;
  onCorrect: () => void;
  onResult?: (isCorrect: boolean) => void;
}

export function MultipleChoiceQuiz({ body, onCorrect, onResult }: MultipleChoiceQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animClass, setAnimClass] = useState('');

  const isCorrect = selected === body.correctIndex;

  const triggerAnim = useCallback((correct: boolean) => {
    setAnimClass(correct ? 'answer-correct' : 'answer-incorrect');
    setTimeout(() => setAnimClass(''), 600);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected === null) return;
    setIsSubmitted(true);
    const correct = selected === body.correctIndex;
    triggerAnim(correct);
    onResult?.(correct);
    if (correct) {
      onCorrect();
    }
  }, [selected, body.correctIndex, triggerAnim, onResult, onCorrect]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!isSubmitted) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= body.options.length) {
          e.preventDefault();
          setSelected(num - 1);
        } else {
          const charCode = e.key.toUpperCase().charCodeAt(0);
          if (e.key.length === 1 && charCode >= 65 && charCode < 65 + body.options.length) {
            e.preventDefault();
            setSelected(charCode - 65);
          } else if (e.key === 'Enter' && selected !== null) {
            e.preventDefault();
            handleSubmit();
          }
        }
      } else if (e.key === 'Enter' && !isCorrect) {
        e.preventDefault();
        setIsSubmitted(false);
        setSelected(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, selected, body.options.length, isCorrect, handleSubmit]);

  return (
    <div className={`quiz-container mcq-quiz ${animClass}`}>
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
