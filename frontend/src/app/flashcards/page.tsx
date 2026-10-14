'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Flashcard } from '@/components/srs/Flashcard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { sounds } from '@/lib/soundEffects';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import {
  getLanguages,
  getLevels,
  getModules,
  getFlashcardDecks,
  getFlashcards,
  reviewSrsCard,
} from '@/lib/api';
import { FlashcardResponse, FlashcardDeckResponse, LanguageResponse, LevelResponse, ModuleResponse } from '@/lib/types';
import './flashcards.css';

export default function FlashcardsPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([]);
  const [selectedLangCode, setSelectedLangCode] = useState('ja');
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [decks, setDecks] = useState<FlashcardDeckResponse[]>([]);

  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [deckComplete, setDeckComplete] = useState(false);

  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [levelsLoadedFor, setLevelsLoadedFor] = useState<string | null>(null);
  const [modulesLoadedFor, setModulesLoadedFor] = useState<string | null>(null);
  const [decksLoadedFor, setDecksLoadedFor] = useState<string | null>(null);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLang = languages.find(l => l.code === selectedLangCode);
  const loadingLevels = !!selectedLang && levelsLoadedFor !== selectedLang.id;
  const loadingModules = !!selectedLevelId && modulesLoadedFor !== selectedLevelId;
  const loadingDecks = !!selectedModuleId && decksLoadedFor !== selectedModuleId;

  useEffect(() => {
    getLanguages()
      .then(data => {
        setLanguages(data);
        if (data && data.length > 0) {
          const hasJa = data.some(l => l.code === 'ja');
          if (!hasJa) setSelectedLangCode(data[0].code);
        }
      })
      .catch(() => setError('Failed to load languages'))
      .finally(() => setLoadingLanguages(false));
  }, []);

  useEffect(() => {
    const langId = selectedLang?.id;
    if (!langId) return;
    let cancelled = false;
    getLevels(langId)
      .then(data => {
        if (cancelled) return;
        setLevels(data);
        setLevelsLoadedFor(langId);
        setSelectedLevelId(data.length > 0 ? data[0].id : null);
        setModules([]);
        setDecks([]);
        setSelectedDeck(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load levels');
        setLevelsLoadedFor(langId);
      });
    return () => { cancelled = true; };
  }, [selectedLang?.id]);

  useEffect(() => {
    if (!selectedLevelId) return;
    let cancelled = false;
    getModules(selectedLevelId)
      .then(data => {
        if (cancelled) return;
        setModules(data);
        setModulesLoadedFor(selectedLevelId);
        setSelectedModuleId(data.length > 0 ? data[0].id : null);
        setDecks([]);
        setSelectedDeck(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load modules');
        setModulesLoadedFor(selectedLevelId);
      });
    return () => { cancelled = true; };
  }, [selectedLevelId]);

  useEffect(() => {
    if (!selectedModuleId) return;
    let cancelled = false;
    getFlashcardDecks(selectedModuleId)
      .then(data => {
        if (cancelled) return;
        setDecks(data);
        setDecksLoadedFor(selectedModuleId);
        setSelectedDeck(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load decks');
        setDecksLoadedFor(selectedModuleId);
      });
    return () => { cancelled = true; };
  }, [selectedModuleId]);

  const selectDeck = (deckId: string) => {
    setSelectedDeck(deckId);
    setCurrentCardIndex(0);
    setDeckComplete(false);
    setLoadingFlashcards(true);
    getFlashcards(deckId)
      .then(data => setFlashcards(data))
      .catch(() => setError('Failed to load flashcards'))
      .finally(() => setLoadingFlashcards(false));
  };

  const handleReview = (quality: number) => {
    const card = flashcards[currentCardIndex];
    if (card) {
      reviewSrsCard(card.id, quality).catch(err => {
        console.error('Failed to submit review:', err);
      });
    }

    if (currentCardIndex + 1 < flashcards.length) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setDeckComplete(true);
      sounds.playCelebration();
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setDeckComplete(false);
  };

  const handleBack = () => {
    setSelectedDeck(null);
    setFlashcards([]);
    setDeckComplete(false);
  };

  const currentCard = flashcards[currentCardIndex];
  const showSelectors = !selectedDeck;

  return (
    <MainLayout>
      <div className="flashcards-page">
        <header className="flashcards-header">
          <h1>Flashcards</h1>
          <p>Review vocabulary with spaced repetition</p>
        </header>

        {showSelectors && (
          <>
            <header className="flashcards-selectors-lessons-header">
              <div className="language-tabs">
                {loadingLanguages ? (
                  <p className="loading-text">Loading languages...</p>
                ) : (
                  languages.map(lang => (
                    <button
                      key={lang.code}
                      className={`lang-tab ${selectedLangCode === lang.code ? 'active' : ''}`}
                      onClick={() => setSelectedLangCode(lang.code)}
                    >
                      {lang.name} ({lang.framework})
                    </button>
                  ))
                )}
              </div>
            </header>

            <section className="levels-section">
              <h2>Levels</h2>
              {loadingLevels ? (
                <div className="levels-grid">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-item skeleton-level-card" />
                  ))}
                </div>
              ) : levels.length > 0 ? (
                <div className="levels-grid">
                  {levels.map(level => (
                    <button
                      key={level.id}
                      className={`level-card ${selectedLevelId === level.id ? 'active' : ''}`}
                      onClick={() => setSelectedLevelId(level.id)}
                    >
                      <span className="level-code">{level.code}</span>
                      <span className="level-name">{level.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="loading-text">No levels found for this language.</p>
              )}
            </section>

            {(loadingModules || modules.length > 0) && (
              <section className="modules-section">
                <h2>Modules</h2>
                {loadingModules ? (
                  <div className="modules-grid">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="skeleton-item skeleton-module-card" />
                    ))}
                  </div>
                ) : (
                  <div className="modules-grid">
                    {modules.map(mod => (
                      <Card
                        key={mod.id}
                        className={`module-card ${selectedModuleId === mod.id ? 'selected' : ''}`}
                        onClick={() => setSelectedModuleId(mod.id)}
                      >
                        <CardContent>
                          <div className="module-type-badge">{mod.type}</div>
                          <h3 className="module-title">{mod.title}</h3>
                          <p className="module-desc">{mod.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="flashcards-decks-section">
              <h2>Decks</h2>
              {loadingDecks ? (
                <div className="deck-grid">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-item skeleton-deck-card" />
                  ))}
                </div>
              ) : decks.length > 0 ? (
                <div className="deck-grid">
                  {decks.map(deck => (
                    <Card key={deck.id} className="deck-card">
                      <CardContent>
                        <h3 className="deck-title">{deck.title}</h3>
                        <p className="deck-desc">{deck.description}</p>
                        <div className="deck-meta">
                          <span>{deck.cardCount} cards</span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => selectDeck(deck.id)}
                        >
                          Start Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !loadingModules && modules.length > 0 ? (
                <p className="loading-text">No decks found for this module.</p>
              ) : null}
            </section>
          </>
        )}

        {loadingFlashcards && selectedDeck && (
          <div className="review-loading">
            <p className="loading-text">Loading cards...</p>
          </div>
        )}

        {!loadingFlashcards && selectedDeck && deckComplete && (
          <div className="review-complete glass-card shadow-xl">
            <div className="complete-icon">
              <Sparkles size={48} className="text-amber-500 fill-amber-400 inline-block" />
            </div>
            <h2>Deck Complete!</h2>
            <p>You reviewed all {flashcards.length} cards in this deck.</p>
            <div className="complete-actions">
              <Button variant="primary" onClick={handleRestart} leftIcon={<RotateCcw size={16} />}>
                Restart Deck
              </Button>
              <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft size={16} />}>
                Back to Decks
              </Button>
            </div>
          </div>
        )}

        {!loadingFlashcards && selectedDeck && !deckComplete && currentCard && (
          <div className="review-session">
            <div className="review-progress-wrap" style={{ width: '100%', maxWidth: 500, margin: '0 auto 1.5rem auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Card {currentCardIndex + 1} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>of {flashcards.length}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>
                  Exit
                </Button>
              </div>
              <ProgressBar value={Math.round(((currentCardIndex + 1) / flashcards.length) * 100)} size="sm" />
            </div>
            <Flashcard card={currentCard} onReview={handleReview} />
          </div>
        )}

        {error && !loadingLanguages && !loadingLevels && !loadingModules && !loadingDecks && (
          <div className="flashcards-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
