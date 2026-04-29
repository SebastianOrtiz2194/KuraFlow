import { LessonDetailResponse } from './types';

/**
 * Mock lesson data simulating the content-service API response.
 * Used for frontend development before backend integration.
 *
 * This lesson teaches basic Japanese self-introduction (jikoshoukai),
 * demonstrating EXPLANATION and EXAMPLE content types with furigana.
 */
export const mockLessonDetail: LessonDetailResponse = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  moduleId: 'mod-grammar-n5-001',
  title: 'Self-Introduction (Jikoshoukai)',
  description: 'Learn to introduce yourself in Japanese using basic copula and particles.',
  estimatedMinutes: 12,
  xpReward: 15,
  contents: [
    {
      id: 'step-001',
      contentType: 'EXPLANATION',
      sortOrder: 1,
      title: 'The Copula: desu (です)',
      body: {
        html: `<p>In Japanese, <strong>です (desu)</strong> functions as the copula — similar to "is/am/are" in English. It is placed at the <em>end</em> of a sentence to make it polite.</p>
<p>The basic pattern is:</p>
<p class="grammar-pattern"><strong>[Noun] です。</strong></p>
<p>This literally translates to "[Noun] is." — but in Japanese, the subject is often omitted when it is obvious from context.</p>`,
        tips: [
          'Unlike English, the verb always goes at the end of the sentence in Japanese.',
          'です (desu) is the polite form. The casual equivalent is だ (da).',
          'Japanese does not use spaces between words — you will rely on particles and kanji to parse sentences.',
        ],
      },
    },
    {
      id: 'step-002',
      contentType: 'EXAMPLE',
      sortOrder: 2,
      title: 'Stating your name',
      body: {
        japanese: '私はセバスチャンです。',
        reading: 'わたし は セバスチャン です。',
        english: 'I am Sebastian.',
        audio_url: '/audio/watashi-wa-sebastian-desu.mp3',
        notes: 'は (wa) is the topic marker particle. Note: it is written with the hiragana は (ha) but pronounced "wa" when used as a particle.',
      },
    },
    {
      id: 'step-003',
      contentType: 'EXPLANATION',
      sortOrder: 3,
      title: 'Topic Marker Particle: wa (は)',
      body: {
        html: `<p>The particle <strong>は (wa)</strong> marks the <em>topic</em> of the sentence — the thing you are talking about.</p>
<p class="grammar-pattern"><strong>[Topic] は [Comment] です。</strong></p>
<p>Think of it as: "As for [Topic], [Comment]."</p>
<p>For self-introductions, <strong>私は (watashi wa)</strong> means "As for me..." and is followed by information about yourself.</p>`,
        tips: [
          'は is written with the character "ha" but pronounced "wa" ONLY when used as a particle.',
          'In casual speech, 私は is often dropped entirely — the context makes it clear you are talking about yourself.',
          'Other topic examples: 東京は (toukyou wa) = "As for Tokyo..."',
        ],
      },
    },
    {
      id: 'step-004',
      contentType: 'EXAMPLE',
      sortOrder: 4,
      title: 'Saying your nationality',
      body: {
        japanese: 'コロンビア人です。',
        reading: 'コロンビアじん です。',
        english: 'I am Colombian.',
        notes: '人 (jin) is a suffix meaning "person of [country]." The topic 私は is omitted because the speaker is obviously talking about themselves.',
      },
    },
    {
      id: 'step-005',
      contentType: 'EXAMPLE',
      sortOrder: 5,
      title: 'Saying your occupation',
      body: {
        japanese: 'エンジニアです。',
        reading: 'エンジニア です。',
        english: 'I am an engineer.',
        notes: 'Many modern occupations in Japanese use katakana loanwords from English. エンジニア (enjinia) comes directly from "engineer."',
      },
    },
    {
      id: 'step-006',
      contentType: 'EXPLANATION',
      sortOrder: 6,
      title: 'Polite Greetings: hajimemashite & yoroshiku',
      body: {
        html: `<p>A full self-introduction in Japanese follows a predictable structure:</p>
<ol>
  <li><strong>はじめまして (hajimemashite)</strong> — "Nice to meet you" (opening)</li>
  <li><strong>[Your information]</strong> — Name, nationality, occupation, etc.</li>
  <li><strong>よろしくおねがいします (yoroshiku onegaishimasu)</strong> — "Please treat me well" (closing)</li>
</ol>
<p>This three-part structure is used in virtually every formal introduction in Japanese society — from business meetings to school classrooms.</p>`,
        tips: [
          'はじめまして literally means "for the first time" — you use it only when meeting someone new.',
          'よろしくおねがいします has no direct English translation. It is a request for a good ongoing relationship.',
          'In casual settings, you can shorten it to よろしく (yoroshiku).',
        ],
      },
    },
    {
      id: 'step-007',
      contentType: 'EXAMPLE',
      sortOrder: 7,
      title: 'Full self-introduction',
      body: {
        japanese: 'はじめまして。私はセバスチャンです。コロンビア人です。エンジニアです。よろしくおねがいします。',
        reading: 'はじめまして。わたし は セバスチャン です。コロンビアじん です。エンジニア です。よろしく おねがいします。',
        english: 'Nice to meet you. I am Sebastian. I am Colombian. I am an engineer. Please treat me well.',
        audio_url: '/audio/full-jikoshoukai.mp3',
        notes: 'Notice how each sentence ends with です, maintaining a consistent polite register throughout.',
      },
    },
  ],
};

/**
 * Mock lesson list for the module view.
 */
export const mockModuleLessons = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    moduleId: 'mod-grammar-n5-001',
    title: 'Self-Introduction (Jikoshoukai)',
    description: 'Learn to introduce yourself in Japanese using basic copula and particles.',
    sortOrder: 1,
    estimatedMinutes: 12,
    xpReward: 15,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    moduleId: 'mod-grammar-n5-001',
    title: 'Questions with Ka (か)',
    description: 'Form basic yes/no questions by adding the particle か.',
    sortOrder: 2,
    estimatedMinutes: 10,
    xpReward: 10,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    moduleId: 'mod-grammar-n5-001',
    title: 'This and That: Kore, Sore, Are',
    description: 'Demonstrative pronouns for near, mid, and far objects.',
    sortOrder: 3,
    estimatedMinutes: 15,
    xpReward: 15,
  },
];
