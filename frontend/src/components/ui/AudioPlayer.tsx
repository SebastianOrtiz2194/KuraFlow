'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  /** URL to the audio file */
  src?: string;
  /** Text to speak via browser Web Speech API fallback */
  text?: string;
  /** Language locale for TTS: e.g. 'ja-JP', 'en-US' */
  lang?: string;
  /** Label displayed next to the play button */
  label?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Audio playback component for pronunciation samples.
 * Plays remote audio when available, and automatically falls back to
 * high-quality browser Web Speech API synthesis for Japanese and English.
 */
export function AudioPlayer({
  src,
  text,
  lang,
  label = 'Listen',
  compact = false,
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Stop any active audio / speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = useCallback(() => {
    const textToSpeak = text || label;
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !textToSpeak) {
      setHasError(true);
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Auto-detect Japanese characters if language is not explicitly provided
      const isJapanese = lang?.startsWith('ja') || /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(textToSpeak);
      utterance.lang = lang || (isJapanese ? 'ja-JP' : 'en-US');
      utterance.rate = 0.9; // Slightly slower for language learners

      // Find best available voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setHasError(false);
        setProgress(30);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setHasError(true);
        setProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setHasError(true);
      setIsPlaying(false);
    }
  }, [text, label, lang]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    // Try HTML5 audio if src is available and hasn't failed yet
    if (src && !hasError) {
      const audio = audioRef.current;
      if (audio) {
        audio.play().catch(() => {
          // Fallback to Web Speech synthesis
          speakText();
        });
        return;
      }
    }

    // Direct Web Speech synthesis fallback
    speakText();
  }, [isPlaying, src, hasError, speakText]);

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

  const handleError = useCallback(() => {
    // If audio element fails to load file, don't break: mark error on audio element
    // so subsequent clicks use Web Speech API fallback
    setHasError(true);
    setIsPlaying(false);
  }, []);

  return (
    <div className={`audio-player ${compact ? 'audio-player--compact' : ''} ${className}`}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
        />
      )}

      <button
        type="button"
        className={`audio-play-btn ${isPlaying ? 'audio-play-btn--playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play pronunciation'}
        title={isPlaying ? 'Stop' : `Listen to ${text || label}`}
      >
        {isPlaying ? (
          <Square size={14} className="fill-current" />
        ) : hasError && !text ? (
          <VolumeX size={16} />
        ) : (
          <Volume2 size={16} />
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
    </div>
  );
}
