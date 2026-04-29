'use client';

import React from 'react';
import './FuriganaText.css';

interface FuriganaTextProps {
  /** The main Japanese text to display */
  text: string;
  /** 
   * Space-separated reading where each token aligns with a character/word.
   * If not provided, text is rendered without furigana.
   */
  reading?: string;
  /**
   * Pitch accent marker (e.g., "0" for heiban, "1" for atamadaka, or "LHL")
   */
  pitchAccent?: string | number;
  /** Font size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders Japanese text with furigana (ruby annotations) above kanji characters.
 * 
 * For Sprint 7, this uses a simplified approach: it renders the full text
 * as the base with the reading annotation above it. A future iteration
 * could parse individual kanji and map readings per-character.
 */
export function FuriganaText({ text, reading, pitchAccent, size = 'md', className = '' }: FuriganaTextProps) {
  const badge = pitchAccent !== undefined ? (
    <span className="pitch-accent-badge" title="Pitch Accent">
      [{pitchAccent}]
    </span>
  ) : null;

  if (!reading) {
    return (
      <span className={`furigana-text furigana-text--${size} ${className}`}>
        {text}
        {badge}
      </span>
    );
  }

  return (
    <span className={`furigana-wrapper ${className}`}>
      <ruby className={`furigana-text furigana-text--${size}`}>
        {text}
        <rp>(</rp>
        <rt className="furigana-reading">{reading}</rt>
        <rp>)</rp>
      </ruby>
      {badge}
    </span>
  );
}
