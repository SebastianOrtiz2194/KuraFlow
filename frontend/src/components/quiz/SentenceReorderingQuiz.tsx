'use client';

import React, { useState, useCallback } from 'react';
import { ReorderBody } from '@/lib/types';
import './Quiz.css';

interface SentenceReorderingQuizProps {
  body: ReorderBody;
  onCorrect: () => void;
  onResult?: (isCorrect: boolean) => void;
}

export function SentenceReorderingQuiz({ body, onCorrect, onResult }: SentenceReorderingQuizProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<string[]>([...body.shuffledItems]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animClass, setAnimClass] = useState('');

  const isCorrect = JSON.stringify(selectedItems) === JSON.stringify(body.correctItems);

  const triggerAnim = useCallback((correct: boolean) => {
    setAnimClass(correct ? 'answer-correct' : 'answer-incorrect');
    setTimeout(() => setAnimClass(''), 600);
  }, []);

  const handleSelectItem = (item: string, index: number) => {
    if (isSubmitted) return;
    const newAvailable = [...availableItems];
    newAvailable.splice(index, 1);
    setAvailableItems(newAvailable);
    setSelectedItems([...selectedItems, item]);
  };

  const handleRemoveItem = (item: string, index: number) => {
    if (isSubmitted) return;
    const newSelected = [...selectedItems];
    newSelected.splice(index, 1);
    setSelectedItems(newSelected);
    setAvailableItems([...availableItems, item]);
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;
    setIsSubmitted(true);
    const correct = JSON.stringify(selectedItems) === JSON.stringify(body.correctItems);
    triggerAnim(correct);
    onResult?.(correct);
    if (correct) {
      onCorrect();
    }
  };

  const handleReset = () => {
    setSelectedItems([]);
    setAvailableItems([...body.shuffledItems]);
    setIsSubmitted(false);
  };

  return (
    <div className={`quiz-container reorder-quiz ${animClass}`}>
      <h2 className="quiz-question">Reorder the sentence</h2>
      
      <div className="reorder-display-area">
        <div className={`selected-pool ${selectedItems.length === 0 ? 'empty' : ''} ${isSubmitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
          {selectedItems.map((item, index) => (
            <button
              key={`selected-${index}`}
              className="reorder-item"
              onClick={() => handleRemoveItem(item, index)}
              disabled={isSubmitted}
            >
              {item}
            </button>
          ))}
          {selectedItems.length === 0 && <span className="placeholder-text">Tap words to build the sentence</span>}
        </div>

        <div className="available-pool">
          {availableItems.map((item, index) => (
            <button
              key={`available-${index}`}
              className="reorder-item available"
              onClick={() => handleSelectItem(item, index)}
              disabled={isSubmitted}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {!isSubmitted ? (
        <div className="reorder-actions">
           <button 
            className="quiz-reset-btn" 
            onClick={handleReset}
            disabled={selectedItems.length === 0}
          >
            Clear
          </button>
          <button 
            className="quiz-submit-btn" 
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
          >
            Check
          </button>
        </div>
      ) : (
        <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <p className="feedback-message">
              {isCorrect ? 'Awesome! You got it.' : 'The order is not quite right.'}
            </p>
            {!isCorrect && (
               <p className="feedback-correct-answer">
                Correct: {body.correctItems.join(' ')}
              </p>
            )}
            {body.explanation && <p className="feedback-explanation">{body.explanation}</p>}
          </div>
          {!isCorrect && (
            <button className="quiz-retry-btn" onClick={handleReset}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
