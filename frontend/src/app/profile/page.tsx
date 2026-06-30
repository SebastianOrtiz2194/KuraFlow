'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getUserProfile, getActivityHistory, getUserInfo } from '@/lib/api';
import { UserProfile, ActivityItem, UserInfo } from '@/lib/types';
import { subscribeToPushNotifications } from '@/lib/push';
import './profile.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setSubscriptionStatus(null);
    try {
      await subscribeToPushNotifications();
      setSubscriptionStatus('Subscribed successfully!');
    } catch (error: unknown) {
      console.error('Subscription error:', error);
      setSubscriptionStatus('Failed to subscribe.');
    } finally {
      setIsSubscribing(false);
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, historyData, infoData] = await Promise.all([
          getUserProfile(),
          getActivityHistory(),
          getUserInfo(),
        ]);
        setProfile(profileData);
        setActivities(historyData);
        setUserInfo(infoData);
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
            {profile.displayName
              ? profile.displayName.substring(0, 2).toUpperCase()
              : '??'}
          </div>
          <div className="profile-info">
            <h1>{userInfo?.displayName || profile.displayName || 'Learner'}</h1>
            <div className="profile-meta">
              <span>{profile.totalXp.toLocaleString()} Total XP</span>
              <span className="meta-divider">•</span>
              <span>{userInfo?.followersCount || 0} Followers</span>
              <span className="meta-divider">•</span>
              <span>{userInfo?.followingCount || 0} Following</span>
            </div>
            <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Badge variant="secondary">Pro Learner</Badge>
              <Button 
                onClick={handleSubscribe} 
                disabled={isSubscribing}
                variant="outline"
                size="sm"
              >
                {isSubscribing ? 'Enabling...' : 'Enable Notifications 🔔'}
              </Button>
              {subscriptionStatus && (
                <span style={{ fontSize: '0.8rem', color: subscriptionStatus.includes('success') ? 'var(--success-text, #10b981)' : 'var(--danger-text, #ef4444)' }}>
                  {subscriptionStatus}
                </span>
              )}
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
                    <Badge variant="outline">
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

        {/* Learning History */}
        <section className="history-section">
          <h2 className="section-title">Recent Learning History 📝</h2>
          <div className="history-list">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    {activity.type === 'LESSON_COMPLETED' ? '📚' : '🧠'}
                  </div>
                  <div className="history-info">
                    <span className="history-text">{activity.description}</span>
                    <span className="history-date">
                      {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="history-xp">+{activity.xpEarned} XP</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                No recent activity yet. Start learning to build your history!
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
