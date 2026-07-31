'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getAuthHeaders, saveLessonProgress } from '@/lib/api';
import {
  LessonContentResponse,
  LessonDetailResponse,
  ExplanationBody,
  ExampleBody,
  MCQBody,
  FillInTheBlankBody,
} from '@/lib/types';
import './lesson.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, checkNewBadges } = useToast();
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<LessonDetailResponse | null>(null);
  const [contents, setContents] = useState<LessonContentResponse[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Interactive Quiz States
  const [mcqChoices, setMcqChoices] = useState<Record<number, number>>({});
  const [reorderSelections, setReorderSelections] = useState<Record<number, string[]>>({});
  const [fillBlankInputs, setFillBlankInputs] = useState<Record<number, string>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [correctSteps, setCorrectSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!lessonId) return;
    fetch(`${API_BASE}/content/lessons/${lessonId}`, {
      headers: { ...getAuthHeaders() },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load lesson');
        return r.json();
      })
      .then((data) => {
        setLesson(data);
        setContents(data.contents || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="lesson-page">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading lesson...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="lesson-page">
          <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
          <Link href="/lessons">
            <Button variant="outline">Back to Lessons</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!lesson || contents.length === 0) {
    return (
      <MainLayout>
        <div className="lesson-page">
          <p style={{ textAlign: 'center', padding: '3rem' }}>No lesson content found.</p>
          <Link href="/lessons">
            <Button variant="outline">Back to Lessons</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const current = contents[currentStep] || contents[0];
  const total = contents.length;

  // MCQ Selection Handler
  const handleSelectMcq = (stepIndex: number, optionIndex: number, body: MCQBody) => {
    let targetCorrectIndex = -1;

    // Standardize correct index check (can be body.correctIndex or body.correct)
    const rawCorrect = (body as unknown as Record<string, unknown>).correctIndex ?? (body as unknown as Record<string, unknown>).correct;
    if (typeof rawCorrect === 'number') {
      targetCorrectIndex = rawCorrect;
    } else if (typeof rawCorrect === 'string') {
      targetCorrectIndex = body.options.findIndex((opt) => opt === rawCorrect);
    }

    const isCorrect = optionIndex === targetCorrectIndex;

    setMcqChoices((prev) => ({ ...prev, [stepIndex]: optionIndex }));
    setCheckedSteps((prev) => ({ ...prev, [stepIndex]: true }));
    setCorrectSteps((prev) => ({ ...prev, [stepIndex]: isCorrect }));

    if (isCorrect) {
      showToast({ title: 'Correct! ✨', description: 'Great job!', type: 'success' });
    }
  };

  // Reorder Word Select / Remove Handler
  const handleToggleReorderWord = (stepIndex: number, word: string, targetWords: string[]) => {
    if (checkedSteps[stepIndex]) return;

    const currentWords = reorderSelections[stepIndex] || [];
    let updatedWords: string[];

    if (currentWords.includes(word)) {
      updatedWords = currentWords.filter((w) => w !== word);
    } else {
      updatedWords = [...currentWords, word];
    }

    setReorderSelections((prev) => ({ ...prev, [stepIndex]: updatedWords }));

    // Auto-check if all words have been arranged
    if (updatedWords.length === targetWords.length) {
      const isCorrect = updatedWords.every((w, i) => w === targetWords[i]);
      setCheckedSteps((prev) => ({ ...prev, [stepIndex]: true }));
      setCorrectSteps((prev) => ({ ...prev, [stepIndex]: isCorrect }));

      if (isCorrect) {
        showToast({ title: 'Sentence Built Correctly! ✨', description: 'Excellent sentence structure!', type: 'success' });
      } else {
        showToast({ title: 'Not quite right', description: 'Check the correct sentence order below.', type: 'info' });
      }
    }
  };

  // Fill in the Blank Handler
  const handleCheckFillBlank = (stepIndex: number, answer: string) => {
    const userInput = fillBlankInputs[stepIndex] || '';
    const isCorrect = userInput.trim().toLowerCase() === answer.trim().toLowerCase();

    setCheckedSteps((prev) => ({ ...prev, [stepIndex]: true }));
    setCorrectSteps((prev) => ({ ...prev, [stepIndex]: isCorrect }));

    if (isCorrect) {
      showToast({ title: 'Correct Answer! ✨', description: 'Well done!', type: 'success' });
    }
  };

  // Handle Completing the Lesson
  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      // Calculate quiz accuracy score
      const quizSteps = contents.filter((c) => c.contentType.startsWith('QUIZ_'));
      let score = 100;
      if (quizSteps.length > 0) {
        const correctCount = quizSteps.filter((_, idx) => correctSteps[idx]).length;
        score = Math.round((correctCount / quizSteps.length) * 100);
      }

      const xpEarned = lesson.xpReward || 20;

      // Save progress to progress-service
      await saveLessonProgress(lessonId, {
        score: score,
        xpEarned: xpEarned,
      });

      // Check for any newly earned badges
      await checkNewBadges();

      showToast({
        title: 'Lesson Completed! 🎉',
        description: `You earned +${xpEarned} XP!`,
        type: 'success',
      });

      router.push('/lessons');
    } catch (err) {
      console.error('Error completing lesson:', err);
      showToast({
        title: 'Lesson Completed!',
        description: `Progress recorded locally.`,
        type: 'success',
      });
      router.push('/lessons');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = (item: LessonContentResponse, stepIndex: number) => {
    switch (item.contentType) {
      case 'EXPLANATION': {
        const body = item.body as ExplanationBody;
        return (
          <div className="lesson-explanation">
            {item.title && <h3>{item.title}</h3>}
            <div dangerouslySetInnerHTML={{ __html: body.html || '' }} />
            {body.tips && body.tips.length > 0 && (
              <div className="lesson-tips">
                <strong>Tips:</strong>
                <ul>
                  {body.tips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      case 'EXAMPLE': {
        const body = item.body as ExampleBody;
        return (
          <div className="lesson-example">
            {item.title && <h3>{item.title}</h3>}
            {body.japanese && <p className="example-japanese">{body.japanese}</p>}
            {body.reading && <p className="example-reading">{body.reading}</p>}
            {body.english && <p className="example-english">{body.english}</p>}
            {body.notes && <p className="example-notes">{body.notes}</p>}
          </div>
        );
      }

      case 'QUIZ_MCQ': {
        const body = item.body as MCQBody;
        const selectedOpt = mcqChoices[stepIndex];
        const isChecked = checkedSteps[stepIndex];
        const rawCorrect = (body as unknown as Record<string, unknown>).correctIndex ?? (body as unknown as Record<string, unknown>).correct;
        let targetCorrectIndex = -1;
        if (typeof rawCorrect === 'number') {
          targetCorrectIndex = rawCorrect;
        } else if (typeof rawCorrect === 'string') {
          targetCorrectIndex = body.options.findIndex((opt) => opt === rawCorrect);
        }

        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">{body.question}</p>
            <div className="quiz-options">
              {(body.options || []).map((opt: string, i: number) => {
                let btnClass = 'quiz-option';
                if (isChecked) {
                  if (i === targetCorrectIndex) {
                    btnClass += ' correct';
                  } else if (i === selectedOpt) {
                    btnClass += ' incorrect';
                  }
                } else if (i === selectedOpt) {
                  btnClass += ' selected';
                }

                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={() => handleSelectMcq(stepIndex, i, body)}
                    disabled={isChecked}
                  >
                    <span>{opt}</span>
                    {isChecked && i === targetCorrectIndex && <span>✓</span>}
                    {isChecked && i === selectedOpt && i !== targetCorrectIndex && <span>✕</span>}
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <div className={`feedback-banner ${correctSteps[stepIndex] ? 'success' : 'danger'}`}>
                <div className="feedback-title">
                  {correctSteps[stepIndex] ? '✨ Correct Answer!' : '❌ Incorrect'}
                </div>
                {body.explanation && <p className="quiz-explanation">{body.explanation}</p>}
              </div>
            )}
          </div>
        );
      }

      case 'QUIZ_REORDER': {
        const rawBody = item.body as Record<string, unknown>;
        const poolWords = (rawBody.words || rawBody.shuffledItems || []) as string[];
        const targetWords = (rawBody.correct || rawBody.correctItems || []) as string[];
        const translation = rawBody.translation as string | undefined;

        const selectedWords = reorderSelections[stepIndex] || [];
        const isChecked = checkedSteps[stepIndex];
        const isCorrect = correctSteps[stepIndex];

        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">Arrange the words to form a sentence:</p>

            {/* Sentence Builder Box */}
            <div
              className={`reorder-builder-box ${
                isChecked ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''
              }`}
            >
              {selectedWords.length > 0 ? (
                selectedWords.map((word, i) => (
                  <span
                    key={i}
                    className="word-chip"
                    onClick={() => handleToggleReorderWord(stepIndex, word, targetWords)}
                  >
                    {word} ✕
                  </span>
                ))
              ) : (
                <span className="reorder-placeholder">Tap words below to build sentence...</span>
              )}
            </div>

            {/* Available Word Pool */}
            <div className="quiz-options">
              {poolWords.map((word: string, i: number) => {
                const isUsed = selectedWords.includes(word);
                return (
                  <button
                    key={i}
                    className={`word-chip ${isUsed ? 'used' : ''}`}
                    onClick={() => handleToggleReorderWord(stepIndex, word, targetWords)}
                    disabled={isUsed || isChecked}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <div className={`feedback-banner ${isCorrect ? 'success' : 'danger'}`}>
                <div className="feedback-title">
                  {isCorrect ? '✨ Perfect Sentence Order!' : '❌ Incorrect Order'}
                </div>
                {!isCorrect && (
                  <p style={{ marginTop: '0.25rem' }}>
                    <strong>Correct Order:</strong> {targetWords.join(' ')}
                  </p>
                )}
                {translation && <p className="quiz-translation">Translation: {translation}</p>}
              </div>
            )}
          </div>
        );
      }

      case 'QUIZ_FILLBLANK': {
        const rawBody = item.body as Record<string, unknown>;
        const sentence = (rawBody.sentence as string) || '';
        const answer = (rawBody.answer || rawBody.correctAnswer || '') as string;
        const explanation = rawBody.explanation as string | undefined;

        const isChecked = checkedSteps[stepIndex];
        const isCorrect = correctSteps[stepIndex];

        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">{sentence}</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="text"
                className="quiz-option"
                style={{ flex: 1, padding: '0.6rem 1rem' }}
                placeholder="Type your answer here..."
                value={fillBlankInputs[stepIndex] || ''}
                onChange={(e) => setFillBlankInputs((prev) => ({ ...prev, [stepIndex]: e.target.value }))}
                disabled={isChecked}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckFillBlank(stepIndex, answer);
                }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCheckFillBlank(stepIndex, answer)}
                disabled={isChecked || !(fillBlankInputs[stepIndex] || '').trim()}
              >
                Check
              </Button>
            </div>

            {isChecked && (
              <div className={`feedback-banner ${isCorrect ? 'success' : 'danger'}`}>
                <div className="feedback-title">
                  {isCorrect ? '✨ Correct Answer!' : '❌ Incorrect'}
                </div>
                {!isCorrect && (
                  <p style={{ marginTop: '0.25rem' }}>
                    <strong>Correct Answer:</strong> {answer}
                  </p>
                )}
                {explanation && <p className="quiz-explanation">{explanation}</p>}
              </div>
            )}
          </div>
        );
      }

      default:
        return <p>Content type: {item.contentType}</p>;
    }
  };

  return (
    <MainLayout>
      <div className="lesson-page">
        <div className="lesson-header">
          <Link href="/lessons">
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
          <div className="lesson-progress">
            <span>
              Step {currentStep + 1} of {total}
            </span>
            <div className="lesson-progress-bar">
              <div
                className="lesson-progress-fill"
                style={{ width: `${((currentStep + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lesson-content">
          <h2 className="lesson-page-title">{lesson.title}</h2>
          <p className="lesson-page-desc">{lesson.description}</p>
          <div className="lesson-meta-bar">
            <span>⏱ {lesson.estimatedMinutes} min</span>
            <span>⭐ {lesson.xpReward} XP Reward</span>
          </div>

          <div className="lesson-step">{renderContent(current, currentStep)}</div>
        </div>

        <div className="lesson-nav">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous
          </Button>
          {currentStep < total - 1 ? (
            <Button variant="primary" onClick={() => setCurrentStep(currentStep + 1)}>
              Next →
            </Button>
          ) : (
            <Button
              variant="primary"
              isLoading={isCompleting}
              onClick={handleCompleteLesson}
            >
              Complete Lesson 🎉
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

