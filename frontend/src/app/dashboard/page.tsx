'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  getAuthToken,
  getUserProfile,
  getUserInfo,
  getActivityHistory,
  getUserProgressList,
  getSrsDueCards,
  getLanguages,
  getLevels,
  getModules,
  getLessons,
} from '@/lib/api';
import type { UserProfile, UserInfo, ActivityItem, LessonResponse, ModuleResponse, LevelResponse } from '@/lib/types';
import type { UserProgressItem, SrsDueCard } from '@/lib/api';
import './dashboard.css';

interface DashboardData {
  profile: UserProfile | null;
  userInfo: UserInfo | null;
  activities: ActivityItem[];
  progressList: UserProgressItem[];
  srsDueCards: SrsDueCard[];
  activeLevel: LevelResponse | null;
  modules: ModuleResponse[];
  lessons: LessonResponse[];
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    profile: null,
    userInfo: null,
    activities: [],
    progressList: [],
    srsDueCards: [],
    activeLevel: null,
    modules: [],
    lessons: [],
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchDashboard() {
      try {
        // Fetch core user data in parallel
        const [profile, userInfo, activities, progressList] = await Promise.all([
          getUserProfile().catch(() => null),
          getUserInfo().catch(() => null),
          getActivityHistory().catch(() => []),
          getUserProgressList().catch(() => []),
        ]);

        // Try to fetch SRS due cards (may fail if user has no cards)
        let srsDueCards: SrsDueCard[] = [];
        try {
          srsDueCards = await getSrsDueCards();
        } catch {
          // SRS cards not available yet — no problem
        }

        // Fetch content hierarchy based on user's selected learning language preference
        let activeLevel: LevelResponse | null = null;
        let modules: ModuleResponse[] = [];
        let lessons: LessonResponse[] = [];

        try {
          const savedLangPref = typeof window !== 'undefined' ? localStorage.getItem('kuraflow_learning_language') : null;
          let targetLangCode = 'ja';
          if (savedLangPref && savedLangPref.toLowerCase().includes('english')) {
            targetLangCode = 'en';
          }

          const languages = await getLanguages();
          const activeLang = languages.find(l => l.code === targetLangCode) || languages[0];
          if (activeLang) {
            const levels = await getLevels(activeLang.id);
            if (levels.length > 0) {
              // Use user's currentLevelId if available, otherwise first level
              if (userInfo?.currentLevelId) {
                activeLevel = levels.find(l => l.id === userInfo.currentLevelId) || levels[0];
              } else {
                activeLevel = levels[0];
              }

              if (activeLevel) {
                modules = await getModules(activeLevel.id);
                // Load lessons across active modules to form learning queue
                if (modules.length > 0) {
                  const lessonPromises = modules.slice(0, 3).map(m => getLessons(m.id).catch(() => []));
                  const loadedArrays = await Promise.all(lessonPromises);
                  lessons = loadedArrays.flat();
                }
              }
            }
          }
        } catch (err) {
          console.error('Content loading failed:', err);
        }

        setData({
          profile: profile,
          userInfo: userInfo,
          activities: activities,
          progressList: progressList,
          srsDueCards: srsDueCards,
          activeLevel: activeLevel,
          modules: modules,
          lessons: lessons,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="dashboard">
          <section className="greeting-section">
            <div className="greeting-content">
              <span className="greeting-wave">👋</span>
              <div>
                <h1 className="greeting-title">Loading...</h1>
                <p className="greeting-subtitle">Fetching your learning data...</p>
              </div>
            </div>
            <div className="quick-stats">
              {[1, 2, 3].map(i => (
                <div key={i} className="stat-pill" style={{ minWidth: 120, opacity: 0.4 }}>
                  <span className="stat-emoji">⏳</span>
                  <span className="stat-number">—</span>
                  <span className="stat-label">Loading</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="dashboard">
          <section className="greeting-section">
            <div className="greeting-content">
              <span className="greeting-wave">⚠️</span>
              <div>
                <h1 className="greeting-title">Something went wrong</h1>
                <p className="greeting-subtitle">{error}</p>
              </div>
            </div>
          </section>
          <Button variant="primary" onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </MainLayout>
    );
  }

  const { profile, userInfo, activities, progressList, srsDueCards, activeLevel, modules, lessons } = data;
  const displayName = userInfo?.displayName || profile?.displayName || 'Learner';
  const currentStreak = profile?.currentStreak ?? 0;
  const totalXp = profile?.totalXp ?? 0;
  const totalLessonsCompleted = profile?.totalLessonsCompleted ?? 0;

  // Calculate daily goal dynamically based on user setting in localStorage
  const configuredGoalStr = typeof window !== 'undefined' ? localStorage.getItem('kuraflow_daily_xp_goal') : null;
  const dailyXpGoal = configuredGoalStr ? parseInt(configuredGoalStr, 10) : 50;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayActivities = activities.filter(
    a => a.timestamp && a.timestamp.slice(0, 10) === todayStr
  );
  const todayXpEarned = todayActivities.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
  const todayLessonsCount = todayActivities.filter(a => a.type === 'LESSON_COMPLETED').length;

  const dailyProgress = Math.min(Math.round((todayXpEarned / dailyXpGoal) * 100), 100);

  // Get completed lesson IDs for progress tracking
  const completedLessonIds = new Set(
    progressList.filter(p => p.status === 'COMPLETED').map(p => p.lessonId)
  );

  // Sort lessons to show uncompleted lessons first
  const sortedLessons = [...lessons].sort((a, b) => {
    const aDone = completedLessonIds.has(a.id) ? 1 : 0;
    const bDone = completedLessonIds.has(b.id) ? 1 : 0;
    return aDone - bDone;
  });

  // SRS stats
  const srsDueCount = srsDueCards.length;
  const srsNewCount = srsDueCards.filter(c => c.status === 'NEW').length;
  const srsTotalCount = srsDueCards.length; // total due

  // Module tags for level card
  const moduleEmojis: Record<string, string> = {
    'GRAMMAR': '📝',
    'VOCABULARY': '📚',
    'KEY_SENTENCES': '💬',
    'FLASHCARDS': '🗂️',
  };

  // Calculate level progress (completed lessons / total available)
  const levelLessonCount = lessons.length || 1;
  const levelCompletedCount = lessons.filter(l => completedLessonIds.has(l.id)).length;
  const levelProgress = Math.round((levelCompletedCount / levelLessonCount) * 100);

  // Lesson visual gradients
  const lessonVisuals = ['lesson-visual-vocab', 'lesson-visual-grammar', 'lesson-visual-phrases'];
  const lessonEmojis = ['🍱', '🚉', '💬', '📖', '🎌'];

  // Activity dot colors
  function getActivityDotClass(type: string): string {
    switch (type) {
      case 'LESSON_COMPLETED': return 'dot-success';
      case 'REVIEW_COMPLETED': return 'dot-primary';
      default: return 'dot-warning';
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Hero / Greeting Section */}
        <section className="greeting-section">
          <div className="greeting-content">
            <span className="greeting-wave">👋</span>
            <div>
              <h1 className="greeting-title">
                Welcome back, <span className="gradient-text">{displayName}</span>
              </h1>
              <p className="greeting-subtitle">
                {totalLessonsCompleted > 0
                  ? `You've completed ${totalLessonsCompleted} lesson${totalLessonsCompleted !== 1 ? 's' : ''} so far. Keep the momentum going!`
                  : 'Start your first lesson to begin your learning journey!'}
              </p>
            </div>
          </div>
          <div className="quick-stats">
            <div className="stat-pill">
              <span className="stat-emoji">🔥</span>
              <span className="stat-number">{currentStreak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-pill">
              <span className="stat-emoji">⭐</span>
              <span className="stat-number">{totalXp.toLocaleString()}</span>
              <span className="stat-label">Total XP</span>
            </div>
            <div className="stat-pill">
              <span className="stat-emoji">📖</span>
              <span className="stat-number">{totalLessonsCompleted}</span>
              <span className="stat-label">Lessons Done</span>
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
                <Badge variant={dailyProgress >= 100 ? 'success' : dailyProgress > 0 ? 'warning' : 'outline'}>
                  {dailyProgress >= 100 ? 'Complete!' : dailyProgress > 0 ? 'On Track' : 'Not Started'}
                </Badge>
              </div>
              <h3 className="card-title">Daily Goal</h3>
              <p className="card-description">
                {dailyProgress >= 100
                  ? 'You hit your daily target! Great job!'
                  : `Earn ${Math.max(0, dailyXpGoal - todayXpEarned)} more XP today to hit your ${dailyXpGoal} XP target.`}
              </p>
              <div className="progress-section">
                <div className="progress-meta">
                  <span>{todayXpEarned} / {dailyXpGoal} XP ({todayLessonsCount} lesson{todayLessonsCount !== 1 ? 's' : ''})</span>
                  <span className="progress-percentage">{dailyProgress}%</span>
                </div>
                <ProgressBar value={dailyProgress} variant="primary" size="md" />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/lessons">
                <Button variant="primary" className="card-action-btn">Continue Learning →</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Current Level Card */}
          {activeLevel && (
            <Card variant="default" onClick={() => router.push(`/level/${activeLevel.id}`)}>
              <CardContent>
                <div className="card-icon-row">
                  <div className="card-icon-circle card-icon-secondary">🇯🇵</div>
                  <Badge variant="primary">{activeLevel.code}</Badge>
                </div>
                <h3 className="card-title">{activeLevel.name || 'Level Track'}</h3>
                <p className="card-description">{activeLevel.description || `Level ${activeLevel.code}`}</p>
                <div className="level-details">
                  <div className="level-modules">
                    {modules.map((mod, i) => (
                      <div key={mod.id} className={`module-tag ${i === 0 ? 'active' : i < 2 ? '' : 'locked'}`}>
                        {moduleEmojis[mod.type] || '📘'} {mod.title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="progress-section">
                  <div className="progress-meta">
                    <span>Level Progress</span>
                    <span className="progress-percentage">{levelProgress}%</span>
                  </div>
                  <ProgressBar value={levelProgress} variant="secondary" size="sm" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SRS Review Card */}
          <Card variant="glass" onClick={() => router.push('/flashcards')}>
            <CardContent>
              <div className="card-icon-row">
                <div className="card-icon-circle card-icon-accent">🧠</div>
                <Badge variant={srsDueCount > 0 ? 'warning' : 'outline'}>
                  {srsDueCount > 0 ? 'Due Today' : 'All Clear'}
                </Badge>
              </div>
              <h3 className="card-title">SRS Review</h3>
              <p className="card-description">
                {srsDueCount > 0
                  ? 'Spaced repetition cards waiting for you.'
                  : 'No cards due right now. Complete lessons to unlock flashcards!'}
              </p>
              <div className="srs-stats">
                <div className="srs-stat">
                  <span className="srs-number">{srsDueCount}</span>
                  <span className="srs-label">Due</span>
                </div>
                <div className="srs-divider" />
                <div className="srs-stat">
                  <span className="srs-number">{srsNewCount}</span>
                  <span className="srs-label">New</span>
                </div>
                <div className="srs-divider" />
                <div className="srs-stat">
                  <span className="srs-number">{srsTotalCount}</span>
                  <span className="srs-label">Total</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/flashcards"><Button variant="secondary" className="card-action-btn">Start Review 🗂️</Button></Link>
            </CardFooter>
          </Card>
        </section>

        {/* Continue Learning Section */}
        {sortedLessons.length > 0 && (
          <section className="continue-section">
            <div className="section-header">
              <h2 className="section-title">Continue Learning</h2>
              <Link href="/lessons"><Button variant="outline" size="sm">Browse All →</Button></Link>
            </div>

            <div className="lessons-grid">
              {sortedLessons.slice(0, 3).map((lesson, i) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const progressEntry = progressList.find(p => p.lessonId === lesson.id);
                const lessonProgress = isCompleted ? 100 : progressEntry ? 50 : 0;
                const visualClass = lessonVisuals[i % lessonVisuals.length];
                const emoji = lessonEmojis[i % lessonEmojis.length];
                const moduleForLesson = modules.find(m => m.id === lesson.moduleId);
                const moduleType = moduleForLesson?.type || 'GRAMMAR';

                return (
                  <Card key={lesson.id} variant="default" onClick={() => router.push(`/lesson/${lesson.id}`)}>
                    <CardContent className="lesson-card-content">
                      <div className={`lesson-visual ${visualClass}`}>
                        <span className="lesson-emoji">{emoji}</span>
                      </div>
                      <div className="lesson-info">
                        <div className="lesson-badges">
                          <Badge variant={moduleType === 'GRAMMAR' ? 'secondary' : moduleType === 'VOCABULARY' ? 'primary' : 'danger'}>
                            {moduleType.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">⏱ {lesson.estimatedMinutes} min</Badge>
                          {isCompleted && <Badge variant="success">Done</Badge>}
                        </div>
                        <h4 className="lesson-title">{lesson.title}</h4>
                        <p className="lesson-desc">{lesson.description}</p>
                        <ProgressBar value={lessonProgress} variant="primary" size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-timeline">
            {activities.length > 0 ? (
              activities.slice(0, 10).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-dot ${getActivityDotClass(activity.type)}`} />
                  <div className="activity-content">
                    <span className="activity-text">
                      <strong>{activity.description}</strong>
                    </span>
                    <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <span className="activity-xp">+{activity.xpEarned} XP ⭐</span>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <div className="activity-dot dot-primary" />
                <div className="activity-content">
                  <span className="activity-text">No activity yet. Complete a lesson to start tracking!</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
