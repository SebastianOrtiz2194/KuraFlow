import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { FuriganaText } from '@/components/ui/FuriganaText';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import {
  Brain,
  Gamepad2,
  Languages,
  Sparkles,
  Trophy,
  WifiOff,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import './landing.css';

export const metadata: Metadata = {
  title: 'KuraFlow — Master Japanese & English with Adaptive SRS',
  description:
    'A modern language learning platform featuring Spaced Repetition (SM-2), Japanese furigana ruby annotations, gamified streaks, and offline PWA support.',
  alternates: {
    canonical: '/',
  },
};

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Background Ambient Glows */}
      <div className="landing-glow-top" />
      <div className="landing-glow-bottom" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'KuraFlow',
            url: 'https://kuraflow.com',
            description:
              "Experience a smarter way to learn languages with KuraFlow's adaptive SRS and gamified learning engine.",
            applicationCategory: 'EducationalApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* Modern Sticky Navigation */}
      <header className="landing-navbar glass">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: '1.5rem' }}>🌊</span>
          <span>KuraFlow</span>
          <span className="brand-pill">v1.0</span>
        </Link>

        <nav className="navbar-nav">
          <Link href="#features" className="navbar-link">
            Features
          </Link>
          <Link href="#showcase" className="navbar-link">
            SRS Preview
          </Link>
          <Link href="#frameworks" className="navbar-link">
            Frameworks
          </Link>
        </nav>

        <div className="navbar-actions">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Start Learning Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill-badge">
          <Zap size={15} className="text-amber-500 fill-amber-400" />
          <span>Intelligent Spaced Repetition (SM-2) Engine</span>
        </div>

        <h1 className="hero-title">
          Master Japanese &amp; English with{' '}
          <span className="gradient-text">Flow</span>
        </h1>

        <p className="hero-subtitle">
          Acquire vocabulary faster, master kanji with live furigana ruby text annotations, and cement
          grammar rules with our scientifically scheduled Spaced Repetition System.
        </p>

        <div className="hero-cta-group">
          <Link href="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Start Learning for Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Explore Dashboard
            </Button>
          </Link>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <span className="hero-stat-value">1,200+</span>
            <span className="hero-stat-label">Seeded Lessons &amp; Cards</span>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          <div className="hero-stat-item">
            <span className="hero-stat-value">SM-2</span>
            <span className="hero-stat-label">Optimized Retention</span>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          <div className="hero-stat-item">
            <span className="hero-stat-value">100% Free</span>
            <span className="hero-stat-label">Web &amp; Offline PWA</span>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Card */}
      <section id="showcase" className="showcase-section">
        <div className="showcase-card">
          <div className="showcase-header">
            <div className="showcase-tag">
              <Sparkles size={14} />
              <span>Interactive Preview</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
              Live Furigana &amp; Web Speech Engine
            </span>
          </div>

          <div className="showcase-body">
            {/* Interactive Flashcard / Furigana Card */}
            <div className="showcase-sample-card shadow-md">
              <div className="sample-audio-btn">
                <AudioPlayer text="たべる" lang="ja-JP" compact />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span className="sample-pitch">Pitch: [2] Nakadaka</span>
              </div>

              <div className="sample-kanji">
                <FuriganaText text="食べる" reading="たべる" size="xl" />
              </div>

              <div className="sample-translation">to eat (ichidan verb)</div>

              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.75rem' }}>
                &ldquo;朝ご飯を食べます。&rdquo; (I eat breakfast.)
              </p>
            </div>

            {/* Feature Description */}
            <div className="showcase-details">
              <div className="showcase-feature-row">
                <CheckCircle2 size={20} className="showcase-feature-icon" />
                <div className="showcase-feature-text">
                  <h4>Ruby Furigana Annotations</h4>
                  <p>Read kanji comfortably with hiragana reading aids rendered directly above characters.</p>
                </div>
              </div>

              <div className="showcase-feature-row">
                <CheckCircle2 size={20} className="showcase-feature-icon" />
                <div className="showcase-feature-text">
                  <h4>Pitch-Accent Guidance</h4>
                  <p>Understand the musical pitch flow of native Tokyo standard Japanese.</p>
                </div>
              </div>

              <div className="showcase-feature-row">
                <CheckCircle2 size={20} className="showcase-feature-icon" />
                <div className="showcase-feature-text">
                  <h4>Instant Audio Pronunciation</h4>
                  <p>Listen to pronunciation samples anytime via native audio or high-definition synthesis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Core Features</span>
          <h2 className="section-title">Designed for Serious Learners</h2>
        </div>

        <div className="features-bento-grid">
          {/* Card 1 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Brain size={22} />
            </div>
            <h3>Adaptive Spaced Repetition</h3>
            <p>Our SuperMemo-2 scheduling algorithm tracks every recall quality and recalculates intervals for long-term retention.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
              <Languages size={22} />
            </div>
            <h3>Multi-format Quizzes</h3>
            <p>Interactive multiple choice, fill-in-the-blank, and sentence reordering with instant feedback and audio chimes.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Gamepad2 size={22} />
            </div>
            <h3>Streaks &amp; Gamified Rewards</h3>
            <p>Earn XP, maintain daily streaks, complete daily quests, and unlock milestone badges with bonus XP multipliers.</p>
          </div>

          {/* Card 4 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Trophy size={22} />
            </div>
            <h3>Real-Time Leaderboards</h3>
            <p>Climb the ranks on weekly and all-time global leaderboards powered by Redis sorted sets.</p>
          </div>

          {/* Card 5 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <WifiOff size={22} />
            </div>
            <h3>Offline PWA &amp; Web Push</h3>
            <p>Installable on desktop and mobile with Serwist service worker caching for offline practice on the go.</p>
          </div>

          {/* Card 6 */}
          <div className="feature-bento-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Sparkles size={22} />
            </div>
            <h3>Curated CEFR &amp; JLPT Tracks</h3>
            <p>Structured progression from beginner to upper-intermediate with grammatical breakdowns and example sentences.</p>
          </div>
        </div>
      </section>

      {/* Language Frameworks Comparison */}
      <section id="frameworks" className="frameworks-section">
        <div className="section-header">
          <span className="section-tag">Curriculum</span>
          <h2 className="section-title">International Proficiency Frameworks</h2>
        </div>

        <div className="frameworks-grid">
          {/* Japanese Track */}
          <div className="framework-card">
            <div className="framework-header">
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Japanese (日本語)</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>JLPT Curriculum Track</p>
              </div>
              <span className="framework-flag">🎌</span>
            </div>

            <div className="framework-levels-chips">
              <span className="level-chip active">N5 (Basic)</span>
              <span className="level-chip">N4 (Elementary)</span>
              <span className="level-chip">N3 (Intermediate)</span>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Focuses on essential hiragana, katakana, core kanji, polite sentence structures, te-form verb conjugations, and essential daily conversations.
            </p>
          </div>

          {/* English Track */}
          <div className="framework-card">
            <div className="framework-header">
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>English (Global)</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>CEFR Standard Track</p>
              </div>
              <span className="framework-flag">🇬🇧</span>
            </div>

            <div className="framework-levels-chips">
              <span className="level-chip active">A1 (Beginner)</span>
              <span className="level-chip">A2 (Elementary)</span>
              <span className="level-chip">B1 (Intermediate)</span>
              <span className="level-chip">B2 (Upper Int.)</span>
              <span className="level-chip">C1 (Advanced)</span>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Comprehensive coverage of foundational tenses, modal verbs, phrasal verbs, idioms, and situational business and academic English.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2>Ready to Begin Your Language Journey?</h2>
          <p>Join KuraFlow today and build a lasting habit with intelligent spaced repetition.</p>
          <Link href="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span>🌊</span>
            <span>KuraFlow</span>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} KuraFlow Platform. Designed for modern language mastery.
          </div>
        </div>
      </footer>
    </div>
  );
}
