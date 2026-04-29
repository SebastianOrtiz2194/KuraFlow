'use client';

import React from 'react';
import { ExampleBody } from '@/lib/types';
import { FuriganaText } from '@/components/ui/FuriganaText';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import './ExampleRenderer.css';

interface ExampleRendererProps {
  /** Title of the example */
  title: string | null;
  /** The EXAMPLE body from lesson_content JSONB */
  body: ExampleBody;
}

/**
 * Renders EXAMPLE content type from the lesson content API.
 * Handles:
 * - Japanese text with furigana readings
 * - English translation
 * - Optional audio playback
 * - Optional grammar/usage notes
 */
export function ExampleRenderer({ title, body }: ExampleRendererProps) {
  return (
    <div className="example-renderer">
      {title && (
        <h3 className="example-title">{title}</h3>
      )}

      <div className="example-card">
        {/* Japanese text with furigana */}
        <div className="example-japanese-section">
          <span className="example-lang-tag">JP</span>
          <div className="example-japanese-text">
            <FuriganaText
              text={body.japanese}
              reading={body.reading}
              pitchAccent={body.pitch_accent}
              size="lg"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="example-divider" />

        {/* English translation */}
        <div className="example-english-section">
          <span className="example-lang-tag example-lang-tag--en">EN</span>
          <p className="example-english-text">{body.english}</p>
        </div>

        {/* Audio player */}
        {body.audio_url && (
          <div className="example-audio-section">
            <AudioPlayer src={body.audio_url} label="Pronunciation" />
          </div>
        )}
      </div>

      {/* Grammar/usage notes */}
      {body.notes && (
        <div className="example-notes">
          <span className="example-notes-icon">📝</span>
          <p className="example-notes-text">{body.notes}</p>
        </div>
      )}
    </div>
  );
}
