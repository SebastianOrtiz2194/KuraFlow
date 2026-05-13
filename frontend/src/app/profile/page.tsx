'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getUserProfile } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import './profile.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="profile-page">
          <div className="empty-state">Loading your profile...</div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="profile-page">
          <div className="empty-state">Failed to load profile. Please try again.</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="profile-page">
        {/* Header Section */}
        <section className="profile-header-card">
          <div className="profile-avatar-large">
            SE
          </div>
          <div className="profile-info">
            <h1>Sebastian Ortiz</h1>
            <div className="profile-meta">
              <span>Member since May 2026</span>
              <span>&bull;</span>
              <span>{profile.totalXp.toLocaleString()} Total XP</span>
            </div>
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Badge variant="secondary">Pro Learner</Badge>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="profile-stats-grid">
          <Card className="stat-card">
            <CardContent>
              <span className="stat-value">🔥 {profile.currentStreak}</span>
              <span className="stat-label">Current Streak</span>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent>
              <span className="stat-value">🏆 #{profile.globalRank || '--'}</span>
              <span className="stat-label">Global Rank</span>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent>
              <span className="stat-value">📖 {profile.totalLessonsCompleted}</span>
              <span className="stat-label">Lessons Done</span>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent>
              <span className="stat-value">✨ {profile.totalPerfectScores}</span>
              <span className="stat-label">Perfect Scores</span>
            </CardContent>
          </Card>
        </section>

        {/* Badges Showcase */}
        <section className="badges-section">
          <h2 className="section-title">Badges & Achievements 🎖️</h2>
          <div className="badges-grid">
            {profile.badges.length > 0 ? (
              profile.badges.map((userBadge) => (
                <div key={userBadge.badgeId} className="badge-item">
                  <div className="badge-icon">
                    {/* Placeholder for badge icons - would use the iconUrl in a real app */}
                    <span style={{ fontSize: '2.5rem' }}>
                      {userBadge.code.includes('STREAK') ? '🔥' : 
                       userBadge.code.includes('LESSON') ? '📚' : 
                       userBadge.code.includes('XP') ? '⭐' : '🏅'}
                    </span>
                  </div>
                  <span className="badge-name">{userBadge.name}</span>
                  <span className="badge-desc">{userBadge.description}</span>
                  <div style={{ marginTop: 'var(--spacing-2)' }}>
                    <Badge variant="outline" size="sm">
                      {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                You haven&apos;t earned any badges yet. Keep learning to unlock them!
              </div>
            )}
          </div>
        </section>

        {/* Learning History (Mock for now, but wired to stats) */}
        <section className="history-section">
          <h2 className="section-title">Recent Learning History 📝</h2>
          <div className="history-list">
            <div className="history-item">
              <div className="history-icon">📚</div>
              <div className="history-info">
                <span className="history-text">Completed &quot;Basic Greetings&quot;</span>
                <span className="history-date">Today at 10:24 AM</span>
              </div>
              <span className="history-xp">+15 XP</span>
            </div>
            <div className="history-item">
              <div className="history-icon">🧠</div>
              <div className="history-info">
                <span className="history-text">SRS Review: 12 cards</span>
                <span className="history-date">Yesterday at 4:15 PM</span>
              </div>
              <span className="history-xp">+8 XP</span>
            </div>
            <div className="history-item">
              <div className="history-icon">🔥</div>
              <div className="history-info">
                <span className="history-text">Maintained 12-day streak!</span>
                <span className="history-date">Yesterday at 4:15 PM</span>
              </div>
              <span className="history-xp">BONUS</span>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
