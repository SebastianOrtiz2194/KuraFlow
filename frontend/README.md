# KuraFlow Frontend

The modern, responsive frontend for the KuraFlow language learning platform, built with Next.js 16 and a custom design system.

## Sprint 5: Design System and Layout

This sprint established the foundational UI/UX for KuraFlow:

- **Custom Design Tokens**: A premium color palette with full dark mode support, modern typography (Inter and Noto Sans JP), and a consistent spacing scale.
- **Component Library**:
  - `Button`: Versatile variants, sizes, and loading states.
  - `Card`: Premium shadows, glassmorphism effects, and interactive hover animations.
  - `Badge`: Semantic statuses and clean tag styling.
  - `ProgressBar`: Animated gradients for tracking learning progress.
- **Responsive Layout**:
  - `Sidebar`: Collapsible desktop navigation with active state indicators.
  - `Header`: Glassmorphism header with theme toggling and search integration.
  - `MobileNav`: Bottom navigation bar for an app-like experience on mobile.

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
