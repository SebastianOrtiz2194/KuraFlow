'use client';

import React, { useState, useRef, useCallback } from 'react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  /** URL to the audio file */
  src: string;
  /** Label displayed next to the play button */
  label?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Audio playback component for pronunciation samples.
 * Provides play/pause/replay controls with a visual waveform-style indicator.
 * 
 * In development mode, since audio files don't exist yet, the component
 * gracefully handles missing sources and shows the controls regardless.
 */
export function AudioPlayer({ src, label = 'Listen', compact = false, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        setHasError(true);
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  return (
    <div className={`audio-player ${compact ? 'audio-player--compact' : ''} ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={() => setHasError(true)}
      />

      <button
        className={`audio-play-btn ${isPlaying ? 'audio-play-btn--playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        title={hasError ? 'Audio unavailable' : label}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        )}
      </button>

      {!compact && (
        <>
          <span className="audio-label">{label}</span>

          <div className="audio-progress-track">
            <div
              className="audio-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Animated waveform bars */}
          <div className={`audio-waveform ${isPlaying ? 'audio-waveform--active' : ''}`}>
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
          </div>
        </>
      )}

      {hasError && (
        <span className="audio-error-indicator" title="Audio file not available">
          !
        </span>
      )}
    </div>
  );
}
