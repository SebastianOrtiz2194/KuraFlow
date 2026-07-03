'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Flashcard } from '@/components/srs/Flashcard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlashcardResponse } from '@/lib/types';
import './flashcards.css';

const mockFlashcards: FlashcardResponse[] = [
  {
    id: 'fc-1',
    deckId: 'deck-n5-001',
    front: { text: 'ありがとう', reading: 'arigatou' },
    back: { text: 'Thank you', example: 'ありがとうございます (arigatou gozaimasu) — more polite form.', notes: 'Used in casual and formal settings.' },
    tags: ['N5', 'expressions'],
  },
  {
    id: 'fc-2',
    deckId: 'deck-n5-001',
    front: { text: 'すみません', reading: 'sumimasen' },
    back: { text: 'Excuse me / I\'m sorry', example: 'すみません、駅はどこですか？ (Excuse me, where is the station?)', notes: 'Also used to get someone\'s attention.' },
    tags: ['N5', 'expressions'],
  },
  {
    id: 'fc-3',
    deckId: 'deck-n5-001',
    front: { text: 'おはよう', reading: 'ohayou' },
    back: { text: 'Good morning', example: 'おはようございます (ohayou gozaimasu) — polite version.', notes: 'Use until about 10am.' },
    tags: ['N5', 'greetings'],
  },
  {
    id: 'fc-4',
    deckId: 'deck-n5-001',
    front: { text: 'こんにちは', reading: 'konnichiwa' },
    back: { text: 'Hello / Good afternoon', example: 'こんにちは、元気ですか？', notes: 'Daytime greeting, roughly 10am-sunset.' },
    tags: ['N5', 'greetings'],
  },
  {
    id: 'fc-5',
    deckId: 'deck-n5-001',
    front: { text: 'さようなら', reading: 'sayounara' },
    back: { text: 'Goodbye', example: 'さようなら、また明日。', notes: 'Formal farewell. Casual: じゃね (ja ne).' },
    tags: ['N5', 'greetings'],
  },
  {
    id: 'fc-6',
    deckId: 'deck-n5-001',
    front: { text: 'はい / いいえ', reading: 'hai / iie' },
    back: { text: 'Yes / No', example: 'はい、そうです。(Yes, that\'s right.)', notes: 'Basic affirmatives and negatives.' },
    tags: ['N5', 'basics'],
  },
  {
    id: 'fc-7',
    deckId: 'deck-n5-001',
    front: { text: '食べる', reading: 'taberu' },
    back: { text: 'To eat', example: 'ご飯を食べる。 (I eat rice.)', notes: 'Dictionary form. Polite: 食べます (tabemasu).' },
    tags: ['N5', 'verbs'],
  },
  {
    id: 'fc-8',
    deckId: 'deck-n5-001',
    front: { text: '飲む', reading: 'nomu' },
    back: { text: 'To drink', example: '水を飲む。 (I drink water.)', notes: 'Polite: 飲みます (nomimasu).' },
    tags: ['N5', 'verbs'],
  },
];

const mockDecks = [
  { id: 'deck-n5-001', title: 'N5 Essential Phrases', description: 'Basic expressions and greetings', cardCount: 8 },
  { id: 'deck-n5-002', title: 'N5 Verbs', description: 'Common dictionary form verbs', cardCount: 4 },
  { id: 'deck-a1-001', title: 'A1 English Basics', description: 'Fundamental English vocabulary', cardCount: 0 },
];

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [deckComplete, setDeckComplete] = useState(false);

  const selectDeck = (deckId: string) => {
    setSelectedDeck(deckId);
    setCurrentCardIndex(0);
    setDeckComplete(false);
  };

  const handleReview = (quality: number) => {
    const deck = mockFlashcards.filter(c => c.deckId === selectedDeck);
    if (currentCardIndex + 1 < deck.length) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setDeckComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setDeckComplete(false);
  };

  const currentDeck = selectedDeck ? mockFlashcards.filter(c => c.deckId === selectedDeck) : [];
  const currentCard = currentDeck[currentCardIndex];

  return (
    <MainLayout>
      <div className="flashcards-page">
        <header className="flashcards-header">
          <h1>Flashcards</h1>
          <p>Review vocabulary with spaced repetition</p>
        </header>

        {!selectedDeck ? (
          <div className="deck-grid">
            {mockDecks.map(deck => (
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
                    disabled={deck.cardCount === 0}
                  >
                    {deck.cardCount > 0 ? 'Start Review' : 'No Cards'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : deckComplete ? (
          <div className="review-complete">
            <div className="complete-icon">🎉</div>
            <h2>Deck Complete!</h2>
            <p>You reviewed {currentDeck.length} cards.</p>
            <div className="complete-actions">
              <Button variant="primary" onClick={handleRestart}>Restart Deck</Button>
              <Button variant="outline" onClick={() => setSelectedDeck(null)}>Back to Decks</Button>
            </div>
          </div>
        ) : currentCard ? (
          <div className="review-session">
            <div className="review-progress">
              <span>Card {currentCardIndex + 1} of {currentDeck.length}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedDeck(null)}>
                Exit
              </Button>
            </div>
            <Flashcard card={currentCard} onReview={handleReview} />
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
