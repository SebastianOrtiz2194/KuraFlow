'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Flashcard } from '@/components/srs/Flashcard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getLanguages,
  getLevels,
  getModules,
  getFlashcardDecks,
  getFlashcards,
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
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingLanguages(true);
    setError(null);
    getLanguages()
      .then(data => {
        setLanguages(data);
        if (data && data.length > 0) {
          const hasJa = data.some(l => l.code === 'ja');
          if (!hasJa) setSelectedLangCode(data[0].code);
        }
      })
      .catch(err => setError(err.message || 'Failed to load languages'))
      .finally(() => setLoadingLanguages(false));
  }, []);

  const selectedLang = languages.find(l => l.code === selectedLangCode);

  useEffect(() => {
    if (!selectedLang) return;
    setLoadingLevels(true);
    setSelectedLevelId(null);
    setModules([]);
    setDecks([]);
    setSelectedDeck(null);
    setError(null);
    getLevels(selectedLang.id)
      .then(data => {
        setLevels(data);
        if (data.length > 0) setSelectedLevelId(data[0].id);
      })
      .catch(() => setError('Failed to load levels'))
      .finally(() => setLoadingLevels(false));
  }, [selectedLang?.id]);

  useEffect(() => {
    if (!selectedLevelId) return;
    setLoadingModules(true);
    setModules([]);
    setDecks([]);
    setSelectedDeck(null);
    setError(null);
    getModules(selectedLevelId)
      .then(data => {
        setModules(data);
        if (data.length > 0) setSelectedModuleId(data[0].id);
      })
      .catch(() => setError('Failed to load modules'))
      .finally(() => setLoadingModules(false));
  }, [selectedLevelId]);

  useEffect(() => {
    if (!selectedModuleId) return;
    setLoadingDecks(true);
    setDecks([]);
    setSelectedDeck(null);
    setError(null);
    getFlashcardDecks(selectedModuleId)
      .then(data => setDecks(data))
      .catch(() => setError('Failed to load decks'))
      .finally(() => setLoadingDecks(false));
  }, [selectedModuleId]);

  const selectDeck = (deckId: string) => {
    setSelectedDeck(deckId);
    setCurrentCardIndex(0);
    setDeckComplete(false);
    setLoadingFlashcards(true);
    setError(null);
    getFlashcards(deckId)
      .then(data => setFlashcards(data))
      .catch(() => setError('Failed to load flashcards'))
      .finally(() => setLoadingFlashcards(false));
  };

  const handleReview = (quality: number) => {
    if (currentCardIndex + 1 < flashcards.length) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setDeckComplete(true);
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
          <div className="review-complete">
            <div className="complete-icon">🎉</div>
            <h2>Deck Complete!</h2>
            <p>You reviewed {flashcards.length} cards.</p>
            <div className="complete-actions">
              <Button variant="primary" onClick={handleRestart}>Restart Deck</Button>
              <Button variant="outline" onClick={handleBack}>Back to Decks</Button>
            </div>
          </div>
        )}

        {!loadingFlashcards && selectedDeck && !deckComplete && currentCard && (
          <div className="review-session">
            <div className="review-progress">
              <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
              <Button variant="outline" size="sm" onClick={handleBack}>
                Exit
              </Button>
            </div>
            <Flashcard card={currentCard} onReview={handleReview} />
          </div>
        )}

        {error && (
          <div className="flashcards-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
