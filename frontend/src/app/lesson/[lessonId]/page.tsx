'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { getAuthHeaders } from '@/lib/api';
import { LessonContentResponse } from '@/lib/types';
import './lesson.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [contents, setContents] = useState<LessonContentResponse[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lessonId) return;
    fetch(`${API_BASE}/content/lessons/${lessonId}`, {
      headers: { ...getAuthHeaders() },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load lesson');
        return r.json();
      })
      .then(data => {
        setLesson(data);
        setContents(data.contents || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="lesson-page"><p>Loading lesson...</p></div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="lesson-page">
          <p style={{ color: 'var(--danger-color)' }}>Error: {error}</p>
          <Link href="/lessons"><Button variant="outline">Back to Lessons</Button></Link>
        </div>
      </MainLayout>
    );
  }

  if (!lesson || contents.length === 0) {
    return (
      <MainLayout>
        <div className="lesson-page">
          <p>No lesson content found.</p>
          <Link href="/lessons"><Button variant="outline">Back to Lessons</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const current = contents[currentStep] || contents[0];
  const total = contents.length;

  const renderContent = (item: LessonContentResponse) => {
    const body = item.body as any;

    switch (item.contentType) {
      case 'EXPLANATION':
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

      case 'EXAMPLE':
        return (
          <div className="lesson-example">
            {item.title && <h3>{item.title}</h3>}
            {body.japanese && <p className="example-japanese">{body.japanese}</p>}
            {body.reading && <p className="example-reading">{body.reading}</p>}
            {body.english && <p className="example-english">{body.english}</p>}
            {body.notes && <p className="example-notes">{body.notes}</p>}
          </div>
        );

      case 'QUIZ_MCQ':
        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">{body.question}</p>
            <div className="quiz-options">
              {(body.options as string[] || []).map((opt: string, i: number) => (
                <button key={i} className="quiz-option">{opt}</button>
              ))}
            </div>
            {body.explanation && <p className="quiz-explanation">{body.explanation}</p>}
          </div>
        );

      case 'QUIZ_REORDER':
        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">Arrange the words to form a sentence:</p>
            <div className="quiz-options">
              {(body.words as string[] || []).map((word: string, i: number) => (
                <button key={i} className="quiz-option">{word}</button>
              ))}
            </div>
            {body.translation && <p className="quiz-translation">Translation: {body.translation}</p>}
          </div>
        );

      case 'QUIZ_FILLBLANK':
        return (
          <div className="lesson-quiz">
            {item.title && <h3>{item.title}</h3>}
            <p className="quiz-question">{body.sentence}</p>
            {body.explanation && <p className="quiz-explanation">{body.explanation}</p>}
          </div>
        );

      default:
        return <p>Content type: {item.contentType}</p>;
    }
  };

  return (
    <MainLayout>
      <div className="lesson-page">
        <div className="lesson-header">
          <Link href="/lessons"><Button variant="outline" size="sm">← Back</Button></Link>
          <div className="lesson-progress">
            <span>Step {currentStep + 1} of {total}</span>
            <div className="lesson-progress-bar">
              <div className="lesson-progress-fill" style={{ width: `${((currentStep + 1) / total) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="lesson-content">
          <h2 className="lesson-page-title">{lesson.title}</h2>
          <p className="lesson-page-desc">{lesson.description}</p>
          <div className="lesson-meta-bar">
            <span>{lesson.estimatedMinutes} min</span>
            <span>{lesson.xpReward} XP</span>
          </div>

          <div className="lesson-step">
            {renderContent(current)}
          </div>
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
              Next
            </Button>
          ) : (
            <Link href="/lessons"><Button variant="primary">Complete Lesson</Button></Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
