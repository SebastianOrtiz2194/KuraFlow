'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { getModules, getLessons, getUserProgressList, getLanguages, getLevels } from '@/lib/api';
import { ModuleResponse, LessonResponse, LevelResponse } from '@/lib/types';
import './level.css';

interface ModuleWithLessons {
  module: ModuleResponse;
  lessons: LessonResponse[];
  completedCount: number;
  totalCount: number;
  firstUncompletedLessonId?: string;
  firstLessonId?: string;
}

export default function LevelOverviewPage({ params }: { params: Promise<{ levelId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const levelId = resolvedParams.levelId;

  const [levelInfo, setLevelInfo] = useState<LevelResponse | null>(null);
  const [moduleList, setModuleList] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLevelData() {
      try {
        setLoading(true);
        // Load modules & progress list in parallel
        const [modulesData, progressList] = await Promise.all([
          getModules(levelId).catch(() => []),
          getUserProgressList().catch(() => []),
        ]);

        const completedLessonIds = new Set(
          progressList.filter(p => p.status === 'COMPLETED').map(p => p.lessonId)
        );

        // Try to fetch level info for clean title
        try {
          const languages = await getLanguages();
          for (const lang of languages) {
            const levels = await getLevels(lang.id);
            const match = levels.find(l => l.id === levelId || l.code.toLowerCase() === levelId.toLowerCase());
            if (match) {
              setLevelInfo(match);
              break;
            }
          }
        } catch {
          // Level info fallback
        }

        // Fetch lessons for each module
        const modulesWithDetails: ModuleWithLessons[] = await Promise.all(
          modulesData.map(async (mod) => {
            let lessons: LessonResponse[] = [];
            try {
              lessons = await getLessons(mod.id);
            } catch {
              lessons = [];
            }
            const completedCount = lessons.filter(l => completedLessonIds.has(l.id)).length;
            const uncompleted = lessons.find(l => !completedLessonIds.has(l.id));

            return {
              module: mod,
              lessons: lessons,
              completedCount: completedCount,
              totalCount: lessons.length,
              firstUncompletedLessonId: uncompleted?.id,
              firstLessonId: lessons[0]?.id,
            };
          })
        );

        setModuleList(modulesWithDetails);
      } catch (err) {
        console.error('Error loading level overview:', err);
        setError('Failed to load level modules. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadLevelData();
  }, [levelId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="level-overview-container">
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <p>Loading level details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || moduleList.length === 0) {
    return (
      <MainLayout>
        <div className="level-overview-container">
          <header className="level-header">
            <h1 className="level-title">{levelInfo ? levelInfo.name : 'Level Details'}</h1>
          </header>
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <p>{error || 'No modules found for this level.'}</p>
            <Button style={{ marginTop: '1rem' }} variant="primary" onClick={() => router.push('/lessons')}>
              Browse All Lessons
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate overall level stats
  const totalModuleCount = moduleList.length;
  const completedModuleCount = moduleList.filter(m => m.totalCount > 0 && m.completedCount === m.totalCount).length;
  const totalLessonsInLevel = moduleList.reduce((acc, m) => acc + m.totalCount, 0);
  const completedLessonsInLevel = moduleList.reduce((acc, m) => acc + m.completedCount, 0);
  const overallPercentage = totalLessonsInLevel > 0 ? Math.round((completedLessonsInLevel / totalLessonsInLevel) * 100) : 0;
  const totalXpInLevel = moduleList.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.xpReward, 0), 0);

  const displayLevelTitle = levelInfo ? `${levelInfo.name} (${levelInfo.code})` : `Level Overview`;

  return (
    <MainLayout>
      <div className="level-overview-container">
        <header className="level-header">
          <div className="level-title-section">
            <div className="level-breadcrumb">
              <span>Learning Track</span>
              <span>›</span>
              <span>Levels</span>
            </div>
            <h1 className="level-title">
              {displayLevelTitle}
              <Badge variant={overallPercentage >= 100 ? 'success' : overallPercentage > 0 ? 'primary' : 'outline'}>
                {overallPercentage}% Complete
              </Badge>
            </h1>
          </div>
          <div className="level-stats">
            <div className="level-stat">
              <span className="level-stat-label">Modules</span>
              <span className="level-stat-value">{completedModuleCount} / {totalModuleCount}</span>
            </div>
            <div className="level-stat">
              <span className="level-stat-label">Total XP</span>
              <span className="level-stat-value">{totalXpInLevel}</span>
            </div>
          </div>
        </header>

        <div className="modules-grid">
          {moduleList.map((item, index) => {
            const { module: mod, completedCount, totalCount, firstUncompletedLessonId, firstLessonId } = item;
            const isCompleted = totalCount > 0 && completedCount === totalCount;
            const isInProgress = completedCount > 0 && !isCompleted;
            const isLocked = index > 0 && moduleList[index - 1].completedCount === 0 && !isInProgress && !isCompleted;

            const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const targetLessonId = firstUncompletedLessonId || firstLessonId;

            const handleAction = () => {
              if (targetLessonId) {
                router.push(`/lesson/${targetLessonId}`);
              } else {
                router.push('/lessons');
              }
            };

            return (
              <Card key={mod.id} className={`module-card ${isLocked ? 'locked' : ''}`}>
                <CardContent>
                  <div className={`module-icon-wrapper ${isCompleted ? 'module-icon-completed' : isLocked ? 'module-icon-locked' : 'module-icon-active'}`}>
                    {isLocked ? '🔒' : mod.type === 'GRAMMAR' ? '文法' : mod.type === 'VOCABULARY' ? '📚' : 'あ'}
                  </div>
                  <h3 className="module-title">{mod.title}</h3>
                  <p className="module-desc">{mod.description}</p>

                  <div className="module-meta">
                    <span className="module-lessons">{completedCount}/{totalCount} Lessons</span>
                    <span className={`module-status-badge ${isCompleted ? 'status-completed' : isInProgress ? 'status-active' : 'status-locked'}`}>
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isLocked ? 'Locked' : 'Available'}
                    </span>
                  </div>

                  <div className="module-footer">
                    <div className="module-progress-wrapper">
                      <ProgressBar value={progressPercentage} variant={isCompleted ? 'secondary' : 'primary'} size="sm" />
                    </div>
                    {isLocked ? (
                      <Button variant="secondary" size="sm" disabled>Locked</Button>
                    ) : isCompleted ? (
                      <Button variant="outline" size="sm" onClick={handleAction}>Review</Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={handleAction}>Continue</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}

