# KuraFlow Frontend

The modern, responsive frontend for the KuraFlow language learning platform, built with Next.js 16 and a custom design system.

## Recent Sprints & Features

### Sprint 5 & 6: Design System, Layout & Auth
- **Custom Design Tokens**: A premium color palette with full dark mode support, modern typography (Inter and Noto Sans JP), and a consistent spacing scale.
- **Component Library**:
  - `Button`: Versatile variants, sizes, and loading states.
  - `Card`: Premium shadows, glassmorphism effects, and interactive hover animations.
  - `Badge`: Semantic statuses and clean tag styling.
  - `ProgressBar`: Animated gradients for tracking learning progress.
- **Auth & Dashboard**: Full login/register flows with Next.js middleware and a dynamic dashboard overview.

### Sprint 7, 8 & 9: Learning Engine
- **Lesson Player**: Multi-step content renderer for explanations and examples, with Japanese Furigana and Audio playback.
- **Interactive Quiz Engine**: Multiple Choice, Fill-in-the-blank, and Sentence Reordering with real-time score calculation and animations (Confetti, XP toasts, Score Ring).
- **Spaced Repetition System (SRS)**: Flashcard UI with flip animations and quality rating interface (Again, Hard, Good, Easy).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS + CSS Variables (Design Tokens)
- **Icons**: SVGs
- **Fonts**: Google Fonts (Inter, Noto Sans JP)
- **Theme**: Light/Dark mode via data-theme and localStorage

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 to view the KuraFlow dashboard.

## Structure

- `src/app`: Routes and global styles.
- `src/components/ui`: Primitive UI components.
- `src/components/layout`: Global layout components (Sidebar, Header, etc.).
