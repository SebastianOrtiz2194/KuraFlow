'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import './level.css';

export default function LevelOverviewPage({ params }: { params: { levelId: string } }) {
  // In a real app, this would be fetched based on levelId
  const levelTitle = params.levelId.toUpperCase();
  
  return (
    <MainLayout>
      <div className="level-overview-container">
        <header className="level-header">
          <div className="level-title-section">
            <div className="level-breadcrumb">
              <span>Japanese</span>
              <span>›</span>
              <span>Levels</span>
            </div>
            <h1 className="level-title">
              {levelTitle === 'N5' ? 'JLPT N5: Beginner' : `Level ${levelTitle}`}
              <Badge variant="primary">35% Complete</Badge>
            </h1>
          </div>
          <div className="level-stats">
            <div className="level-stat">
              <span className="level-stat-label">Modules</span>
              <span className="level-stat-value">2 / 8</span>
            </div>
            <div className="level-stat">
              <span className="level-stat-label">Total XP</span>
              <span className="level-stat-value">450</span>
            </div>
          </div>
        </header>

        <div className="modules-grid">
          {/* Completed Module */}
          <Card className="module-card">
            <CardContent>
              <div className="module-icon-wrapper module-icon-completed">
                あ
              </div>
              <h3 className="module-title">Hiragana & Katakana</h3>
              <p className="module-desc">Master the foundational writing systems of Japanese.</p>
              
              <div className="module-meta">
                <span className="module-lessons">10/10 Lessons</span>
                <span className="module-status-badge status-completed">Completed</span>
              </div>
              
              <div className="module-footer">
                <div className="module-progress-wrapper">
                  <ProgressBar value={100} variant="primary" size="sm" />
                </div>
                <Button variant="outline" size="sm">Review</Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Module */}
          <Card className="module-card">
            <CardContent>
              <div className="module-icon-wrapper module-icon-active">
                文法
              </div>
              <h3 className="module-title">Basic Grammar I</h3>
              <p className="module-desc">Sentence structure, copula (desu/da), and basic particles.</p>
              
              <div className="module-meta">
                <span className="module-lessons">3/12 Lessons</span>
                <span className="module-status-badge status-active">In Progress</span>
              </div>
              
              <div className="module-footer">
                <div className="module-progress-wrapper">
                  <ProgressBar value={25} variant="primary" size="sm" />
                </div>
                <Button variant="primary" size="sm">Continue</Button>
              </div>
            </CardContent>
          </Card>

          {/* Locked Module */}
          <Card className="module-card locked">
            <CardContent>
              <div className="module-icon-wrapper module-icon-locked">
                🔒
              </div>
              <h3 className="module-title">Vocabulary Core 500</h3>
              <p className="module-desc">The most essential words for everyday conversation.</p>
              
              <div className="module-meta">
                <span className="module-lessons">0/20 Lessons</span>
                <span className="module-status-badge status-locked">Locked</span>
              </div>
              
              <div className="module-footer">
                <div className="module-progress-wrapper">
                  <ProgressBar value={0} variant="secondary" size="sm" />
                </div>
                <Button variant="secondary" size="sm" disabled>Locked</Button>
              </div>
            </CardContent>
          </Card>

          {/* Locked Module */}
          <Card className="module-card locked">
            <CardContent>
              <div className="module-icon-wrapper module-icon-locked">
                🔒
              </div>
              <h3 className="module-title">Kanji Introduction</h3>
              <p className="module-desc">Learn the first 80 essential Kanji characters.</p>
              
              <div className="module-meta">
                <span className="module-lessons">0/15 Lessons</span>
                <span className="module-status-badge status-locked">Locked</span>
              </div>
              
              <div className="module-footer">
                <div className="module-progress-wrapper">
                  <ProgressBar value={0} variant="secondary" size="sm" />
                </div>
                <Button variant="secondary" size="sm" disabled>Locked</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
