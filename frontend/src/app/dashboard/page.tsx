'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import './dashboard.css';

export default function Home() {
  const router = useRouter();
  return (
    <MainLayout>
      <div className="dashboard">
        {/* Hero / Greeting Section */}
        <section className="greeting-section">
          <div className="greeting-content">
            <span className="greeting-wave">👋</span>
            <div>
              <h1 className="greeting-title">
                Welcome back, <span className="gradient-text">Sebastian</span>
              </h1>
              <p className="greeting-subtitle">
                You&apos;ve learned 15 new words this week. Keep the momentum going!
              </p>
            </div>
          </div>
          <div className="quick-stats">
            <div className="stat-pill">
              <span className="stat-emoji">🔥</span>
              <span className="stat-number">12</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-pill">
              <span className="stat-emoji">⭐</span>
              <span className="stat-number">1,240</span>
              <span className="stat-label">Total XP</span>
            </div>
            <div className="stat-pill">
              <span className="stat-emoji">📖</span>
              <span className="stat-number">42</span>
              <span className="stat-label">Words Learned</span>
            </div>
          </div>
        </section>

        {/* Main Cards Grid */}
        <section className="cards-grid">
          {/* Daily Goal Card */}
          <Card variant="premium">
            <CardContent>
              <div className="card-icon-row">
                <div className="card-icon-circle card-icon-primary">🎯</div>
                <Badge variant="success">On Track</Badge>
              </div>
              <h3 className="card-title">Daily Goal</h3>
              <p className="card-description">Complete 2 more lessons to hit your daily target.</p>
              <div className="progress-section">
                <div className="progress-meta">
                  <span>3 / 5 lessons</span>
                  <span className="progress-percentage">60%</span>
                </div>
                <ProgressBar value={60} variant="primary" size="md" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" className="card-action-btn">Continue Learning →</Button>
            </CardFooter>
          </Card>

          {/* Current Level Card */}
          <Card variant="default" onClick={() => router.push('/level/n5')}>
            <CardContent>
              <div className="card-icon-row">
                <div className="card-icon-circle card-icon-secondary">🇯🇵</div>
                <Badge variant="primary">N5</Badge>
              </div>
              <h3 className="card-title">Japanese</h3>
              <p className="card-description">Beginner Level &middot; JLPT N5</p>
              <div className="level-details">
                <div className="level-modules">
                  <div className="module-tag">✅ Hiragana</div>
                  <div className="module-tag">✅ Katakana</div>
                  <div className="module-tag active">📝 Grammar</div>
                  <div className="module-tag locked">🔒 Kanji</div>
                </div>
              </div>
              <div className="progress-section">
                <div className="progress-meta">
                  <span>Level Progress</span>
                  <span className="progress-percentage">35%</span>
                </div>
                <ProgressBar value={35} variant="secondary" size="sm" />
              </div>
            </CardContent>
          </Card>

          {/* SRS Review Card */}
          <Card variant="glass" onClick={() => {}}>
            <CardContent>
              <div className="card-icon-row">
                <div className="card-icon-circle card-icon-accent">🧠</div>
                <Badge variant="warning">Due Today</Badge>
              </div>
              <h3 className="card-title">SRS Review</h3>
              <p className="card-description">Spaced repetition cards waiting for you.</p>
              <div className="srs-stats">
                <div className="srs-stat">
                  <span className="srs-number">24</span>
                  <span className="srs-label">Due</span>
                </div>
                <div className="srs-divider" />
                <div className="srs-stat">
                  <span className="srs-number">8</span>
                  <span className="srs-label">New</span>
                </div>
                <div className="srs-divider" />
                <div className="srs-stat">
                  <span className="srs-number">156</span>
                  <span className="srs-label">Total</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="card-action-btn">Start Review 🗂️</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Continue Learning Section */}
        <section className="continue-section">
          <div className="section-header">
            <h2 className="section-title">Continue Learning</h2>
            <Button variant="outline" size="sm">Browse All →</Button>
          </div>
          
          <div className="lessons-grid">
            <Card variant="default" onClick={() => {}}>
              <CardContent className="lesson-card-content">
                <div className="lesson-visual lesson-visual-vocab">
                  <span className="lesson-emoji">🍱</span>
                </div>
                <div className="lesson-info">
                  <div className="lesson-badges">
                    <Badge variant="primary">Vocabulary</Badge>
                    <Badge variant="outline">⏱ 10 min</Badge>
                  </div>
                  <h4 className="lesson-title">Common Food Items</h4>
                  <p className="lesson-desc">Learn how to order at a Japanese restaurant.</p>
                  <ProgressBar value={40} variant="primary" size="sm" />
                </div>
              </CardContent>
            </Card>

            <Card variant="default" onClick={() => {}}>
              <CardContent className="lesson-card-content">
                <div className="lesson-visual lesson-visual-grammar">
                  <span className="lesson-emoji">🚉</span>
                </div>
                <div className="lesson-info">
                  <div className="lesson-badges">
                    <Badge variant="secondary">Grammar</Badge>
                    <Badge variant="outline">⏱ 15 min</Badge>
                  </div>
                  <h4 className="lesson-title">Particles: Ni and De</h4>
                  <p className="lesson-desc">Understanding location and direction markers.</p>
                  <ProgressBar value={10} variant="secondary" size="sm" />
                </div>
              </CardContent>
            </Card>

            <Card variant="default" onClick={() => {}}>
              <CardContent className="lesson-card-content">
                <div className="lesson-visual lesson-visual-phrases">
                  <span className="lesson-emoji">💬</span>
                </div>
                <div className="lesson-info">
                  <div className="lesson-badges">
                    <Badge variant="danger">Key Sentences</Badge>
                    <Badge variant="outline">⏱ 12 min</Badge>
                  </div>
                  <h4 className="lesson-title">Self-Introduction</h4>
                  <p className="lesson-desc">Practice introducing yourself in formal settings.</p>
                  <ProgressBar value={0} variant="accent" size="sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-timeline">
            <div className="activity-item">
              <div className="activity-dot dot-success" />
              <div className="activity-content">
                <span className="activity-text">Completed <strong>Basic Greetings</strong></span>
                <span className="activity-time">2 hours ago</span>
              </div>
              <span className="activity-xp">+15 XP ⭐</span>
            </div>
            <div className="activity-item">
              <div className="activity-dot dot-primary" />
              <div className="activity-content">
                <span className="activity-text">Reviewed <strong>12 flashcards</strong></span>
                <span className="activity-time">5 hours ago</span>
              </div>
              <span className="activity-xp">+8 XP ⭐</span>
            </div>
            <div className="activity-item">
              <div className="activity-dot dot-warning" />
              <div className="activity-content">
                <span className="activity-text">Unlocked badge <strong>First Week 🎖️</strong></span>
                <span className="activity-time">Yesterday</span>
              </div>
              <span className="activity-xp">+50 XP ⭐</span>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
