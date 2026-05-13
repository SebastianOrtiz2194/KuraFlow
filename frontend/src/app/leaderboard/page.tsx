'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardResponse, LeaderboardEntry } from '@/lib/types';
import './leaderboard.css';

export default function LeaderboardPage() {
  const [type, setType] = useState<'weekly' | 'alltime'>('weekly');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getLeaderboard(type);
        setData(result);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [type]);

  const topThree = data?.entries.slice(0, 3) || [];
  const others = data?.entries.slice(3) || [];

  return (
    <MainLayout>
      <div className="leaderboard-page">
        <header className="leaderboard-header">
          <h1 className="leaderboard-title">Leaderboard 🏆</h1>
          <p className="greeting-subtitle">Compete with other learners and climb the ranks!</p>
        </header>

        <div className="leaderboard-tabs">
          <button 
            className={`tab-btn ${type === 'weekly' ? 'is-active' : ''}`}
            onClick={() => setType('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`tab-btn ${type === 'alltime' ? 'is-active' : ''}`}
            onClick={() => setType('alltime')}
          >
            All Time
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading rankings...</div>
        ) : data && data.entries.length > 0 ? (
          <>
            {/* Podium */}
            <div className="podium-container">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="podium-item second">
                  <div className="podium-rank">🥈</div>
                  <div className="podium-avatar-wrapper">
                    <div className="podium-avatar">
                      {topThree[1].displayName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="podium-name">{topThree[1].displayName}</span>
                    <span className="podium-score">{topThree[1].score.toLocaleString()} XP</span>
                  </div>
                  <div className="podium-bar">2</div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="podium-item first">
                  <div className="podium-rank">🥇</div>
                  <div className="podium-avatar-wrapper">
                    <span className="podium-crown">👑</span>
                    <div className="podium-avatar" style={{ width: '100px', height: '100px', fontSize: '2rem' }}>
                      {topThree[0].displayName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="podium-name" style={{ fontSize: '1.1rem' }}>{topThree[0].displayName}</span>
                    <span className="podium-score" style={{ fontWeight: 'bold' }}>{topThree[0].score.toLocaleString()} XP</span>
                  </div>
                  <div className="podium-bar">1</div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="podium-item third">
                  <div className="podium-rank">🥉</div>
                  <div className="podium-avatar-wrapper">
                    <div className="podium-avatar">
                      {topThree[2].displayName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="podium-info">
                    <span className="podium-name">{topThree[2].displayName}</span>
                    <span className="podium-score">{topThree[2].score.toLocaleString()} XP</span>
                  </div>
                  <div className="podium-bar">3</div>
                </div>
              )}
            </div>

            {/* Others List */}
            <div className="leaderboard-list">
              {others.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`leaderboard-row ${entry.userId === data.currentUser?.userId ? 'is-current-user' : ''}`}
                >
                  <div className="rank-cell">#{entry.rank}</div>
                  <div className="user-cell">
                    <div className="user-avatar-sm">
                      {entry.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="user-name-cell">{entry.displayName}</span>
                  </div>
                  <div className="score-cell">
                    {entry.score.toLocaleString()}
                    <span className="xp-label">XP</span>
                  </div>
                </div>
              ))}
              
              {/* If current user is not in top 50, show them at the bottom */}
              {data.currentUser && data.currentUser.rank > data.entries.length && (
                <div className="leaderboard-row is-current-user">
                  <div className="rank-cell">#{data.currentUser.rank}</div>
                  <div className="user-cell">
                    <div className="user-avatar-sm">
                      {data.currentUser.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="user-name-cell">{data.currentUser.displayName} (You)</span>
                  </div>
                  <div className="score-cell">
                    {data.currentUser.score.toLocaleString()}
                    <span className="xp-label">XP</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">No rankings available yet. Start learning to be the first!</div>
        )}
      </div>
    </MainLayout>
  );
}
