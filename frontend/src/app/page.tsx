import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>🏔️ KuraFlow</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Sign up</Button>
          </Link>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, maxWidth: '800px', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Master Japanese & English with <span style={{ color: 'var(--primary-color)' }}>KuraFlow</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Experience a smarter way to learn languages with our adaptive Spaced Repetition System and gamified learning engine.
        </p>
        <Link href="/register">
          <Button variant="primary" size="lg" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Start Learning for Free
          </Button>
        </Link>
      </main>
    </div>
  );
}
