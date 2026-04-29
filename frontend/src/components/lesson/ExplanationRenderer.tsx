'use client';

import React from 'react';
import { ExplanationBody } from '@/lib/types';
import './ExplanationRenderer.css';

interface ExplanationRendererProps {
  /** Title of the explanation section */
  title: string | null;
  /** The EXPLANATION body from lesson_content JSONB */
  body: ExplanationBody;
}

/**
 * Renders EXPLANATION content type from the lesson content API.
 * Handles:
 * - Rich HTML content (grammar explanations, formatted text)
 * - Optional tips list with visual callout styling
 */
export function ExplanationRenderer({ title, body }: ExplanationRendererProps) {
  return (
    <div className="explanation-renderer">
      {title && (
        <h2 className="explanation-title">{title}</h2>
      )}

      <div
        className="explanation-body"
        dangerouslySetInnerHTML={{ __html: body.html }}
      />

      {body.tips && body.tips.length > 0 && (
        <div className="explanation-tips">
          <div className="tips-header">
            <span className="tips-icon">💡</span>
            <span className="tips-label">Tips</span>
          </div>
          <ul className="tips-list">
            {body.tips.map((tip, index) => (
              <li key={index} className="tip-item">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
