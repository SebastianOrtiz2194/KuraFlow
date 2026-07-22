'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getLanguages } from '@/lib/api';
import { subscribeToPushNotifications } from '@/lib/push';
import { LanguageResponse } from '@/lib/types';
import './settings.css';

interface XPGoalOption {
  value: number;
  label: string;
  desc: string;
  emoji: string;
}

const GOAL_OPTIONS: XPGoalOption[] = [
  { value: 20, label: '20 XP / day', desc: 'Casual (approx. 5 mins/day)', emoji: '🌱' },
  { value: 50, label: '50 XP / day', desc: 'Regular (approx. 15 mins/day)', emoji: '⚡' },
  { value: 100, label: '100 XP / day', desc: 'Serious (approx. 30 mins/day)', emoji: '🔥' },
  { value: 150, label: '150 XP / day', desc: 'Intense (approx. 45+ mins/day)', emoji: '🚀' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Settings State
  const [dailyXpGoal, setDailyXpGoal] = useState<number>(50);
  const [streakReminders, setStreakReminders] = useState<boolean>(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Japanese (JLPT)');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  
  // Available Languages State
  const [languages, setLanguages] = useState<LanguageResponse[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  // Modal Open States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);

  // Temp Modal State
  const [tempGoal, setTempGoal] = useState<number>(50);
  const [tempStreak, setTempStreak] = useState<boolean>(true);
  const [tempPush, setTempPush] = useState<boolean>(false);
  const [tempLang, setTempLang] = useState<string>('Japanese (JLPT)');

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Daily XP Goal
    const savedGoal = localStorage.getItem('kuraflow_daily_xp_goal');
    if (savedGoal) {
      setDailyXpGoal(parseInt(savedGoal, 10));
    }

    // Load Notifications
    const savedStreak = localStorage.getItem('kuraflow_streak_reminders');
    if (savedStreak !== null) {
      setStreakReminders(savedStreak === 'true');
    }
    const savedPush = localStorage.getItem('kuraflow_push_enabled');
    if (savedPush !== null) {
      setPushEnabled(savedPush === 'true');
    }

    // Load Learning Language
    const savedLang = localStorage.getItem('kuraflow_learning_language');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }

    // Load Theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Load Sound Effects
    const savedAudio = localStorage.getItem('kuraflow_sound_effects');
    if (savedAudio !== null) {
      setSoundEffects(savedAudio === 'true');
    }
  }, []);

  // Fetch languages when Language Modal opens
  useEffect(() => {
    if (!isLangModalOpen) return;
    async function loadLangs() {
      setIsLoadingLanguages(true);
      try {
        const data = await getLanguages();
        setLanguages(data);
      } catch (err) {
        console.error('Failed to load languages:', err);
      } finally {
        setIsLoadingLanguages(false);
      }
    }
    loadLangs();
  }, [isLangModalOpen]);

  // Handle Theme Change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    let activeTheme = newTheme;
    if (newTheme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', activeTheme);
    showToast({
      title: 'Theme Updated',
      description: `Switched to ${newTheme} mode`,
      type: 'info',
    });
  };

  // Handle Audio Switch
  const handleToggleSound = () => {
    const nextState = !soundEffects;
    setSoundEffects(nextState);
    localStorage.setItem('kuraflow_sound_effects', String(nextState));
    showToast({
      title: 'Sound Settings Saved',
      description: `Sound effects are now ${nextState ? 'enabled' : 'disabled'}`,
      type: 'info',
    });
  };

  // Save Daily XP Goal
  const handleSaveGoal = () => {
    setDailyXpGoal(tempGoal);
    localStorage.setItem('kuraflow_daily_xp_goal', tempGoal.toString());
    setIsGoalModalOpen(false);
    showToast({
      title: 'Daily Goal Updated!',
      description: `Target set to ${tempGoal} XP per day.`,
      type: 'success',
    });
  };

  // Enable Web Push Action
  const handleEnablePush = async () => {
    setIsSubscribingPush(true);
    try {
      await subscribeToPushNotifications();
      setTempPush(true);
      setPushEnabled(true);
      localStorage.setItem('kuraflow_push_enabled', 'true');
      showToast({
        title: 'Push Notifications Enabled 🔔',
        description: 'You will receive streak and learning reminders.',
        type: 'success',
      });
    } catch (err: unknown) {
      console.error(err);
      showToast({
        title: 'Push Subscription Failed',
        description: err instanceof Error ? err.message : 'Permission denied or unsupported.',
        type: 'info',
      });
    } finally {
      setIsSubscribingPush(false);
    }
  };

  // Save Notification Config
  const handleSaveNotifications = () => {
    setStreakReminders(tempStreak);
    setPushEnabled(tempPush);
    localStorage.setItem('kuraflow_streak_reminders', String(tempStreak));
    localStorage.setItem('kuraflow_push_enabled', String(tempPush));
    setIsNotifModalOpen(false);
    showToast({
      title: 'Notification Settings Saved',
      description: 'Your preferences have been updated.',
      type: 'success',
    });
  };

  // Save Learning Language
  const handleSaveLanguage = () => {
    setSelectedLanguage(tempLang);
    localStorage.setItem('kuraflow_learning_language', tempLang);
    setIsLangModalOpen(false);
    showToast({
      title: 'Language Updated',
      description: `Learning focus set to ${tempLang}.`,
      type: 'success',
    });
  };

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    showToast({
      title: 'Logged Out',
      description: 'You have been signed out successfully.',
      type: 'info',
    });
    router.push('/login');
  };

  // Handle Reset Preferences
  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset your local preferences to defaults?')) {
      localStorage.removeItem('kuraflow_daily_xp_goal');
      localStorage.removeItem('kuraflow_streak_reminders');
      localStorage.removeItem('kuraflow_push_enabled');
      localStorage.removeItem('kuraflow_learning_language');
      localStorage.removeItem('kuraflow_sound_effects');
      setDailyXpGoal(50);
      setStreakReminders(true);
      setPushEnabled(false);
      setSelectedLanguage('Japanese (JLPT)');
      setSoundEffects(true);
      showToast({
        title: 'Settings Reset',
        description: 'Preferences restored to defaults.',
        type: 'info',
      });
    }
  };

  return (
    <MainLayout>
      <div className="settings-page">
        <header className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account preferences, notifications, and learning goals.</p>
        </header>

        <div className="settings-section">
          {/* Daily XP Goal */}
          <div className="setting-item">
            <div className="setting-item-info">
              <span className="setting-icon">🎯</span>
              <div>
                <h3>Daily XP Goal</h3>
                <p>{dailyXpGoal} XP per day</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempGoal(dailyXpGoal);
                setIsGoalModalOpen(true);
              }}
            >
              Edit
            </Button>
          </div>

          {/* Notifications */}
          <div className="setting-item">
            <div className="setting-item-info">
              <span className="setting-icon">🔔</span>
              <div>
                <h3>Notifications</h3>
                <p>
                  {streakReminders ? 'Streak reminders enabled' : 'Reminders disabled'}
                  {pushEnabled ? ' • Push active' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempStreak(streakReminders);
                setTempPush(pushEnabled);
                setIsNotifModalOpen(true);
              }}
            >
              Configure
            </Button>
          </div>

          {/* Learning Language */}
          <div className="setting-item">
            <div className="setting-item-info">
              <span className="setting-icon">🌐</span>
              <div>
                <h3>Learning Language</h3>
                <p>{selectedLanguage}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempLang(selectedLanguage);
                setIsLangModalOpen(true);
              }}
            >
              Change
            </Button>
          </div>

          {/* Theme / Appearance */}
          <div className="setting-item">
            <div className="setting-item-info">
              <span className="setting-icon">🎨</span>
              <div>
                <h3>Appearance & Theme</h3>
                <p>Customize interface theme (Light / Dark / System)</p>
              </div>
            </div>
            <div className="theme-toggle-group">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                title="Light Theme"
              >
                ☀️ Light
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                title="Dark Theme"
              >
                🌙 Dark
              </button>
              <button
                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => handleThemeChange('system')}
                title="System Preference"
              >
                💻 Auto
              </button>
            </div>
          </div>

          {/* Audio & Sound Effects */}
          <div className="setting-item">
            <div className="setting-item-info">
              <span className="setting-icon">🔊</span>
              <div>
                <h3>Sound Effects</h3>
                <p>Audio cues for quiz feedback and lesson completion</p>
              </div>
            </div>
            <Button
              variant={soundEffects ? 'primary' : 'outline'}
              size="sm"
              onClick={handleToggleSound}
            >
              {soundEffects ? 'Enabled 🔊' : 'Muted 🔇'}
            </Button>
          </div>

          {/* Account Actions */}
          <div className="setting-item danger-zone">
            <div className="setting-item-info">
              <span className="setting-icon">🚪</span>
              <div>
                <h3>Account & Session</h3>
                <p>Sign out or restore default local preferences</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="sm" onClick={handleResetSettings}>
                Reset
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* MODAL: Daily XP Goal */}
        {isGoalModalOpen && (
          <div className="settings-modal-overlay" onClick={() => setIsGoalModalOpen(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-header">
                <h2>Set Your Daily XP Goal 🎯</h2>
                <button className="modal-close-btn" onClick={() => setIsGoalModalOpen(false)}>
                  &times;
                </button>
              </div>
              <div className="settings-modal-body">
                <p className="modal-subtitle">Select a target that fits your daily schedule and pace:</p>
                <div className="goal-options-grid">
                  {GOAL_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`goal-option-card ${tempGoal === opt.value ? 'selected' : ''}`}
                      onClick={() => setTempGoal(opt.value)}
                    >
                      <span className="goal-emoji">{opt.emoji}</span>
                      <div className="goal-details">
                        <span className="goal-label">{opt.label}</span>
                        <span className="goal-desc">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="settings-modal-footer">
                <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveGoal}>
                  Save Goal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Notifications */}
        {isNotifModalOpen && (
          <div className="settings-modal-overlay" onClick={() => setIsNotifModalOpen(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-header">
                <h2>Configure Notifications 🔔</h2>
                <button className="modal-close-btn" onClick={() => setIsNotifModalOpen(false)}>
                  &times;
                </button>
              </div>
              <div className="settings-modal-body">
                <div className="config-item">
                  <div>
                    <span className="config-title">Streak Protection Reminders</span>
                    <p className="config-desc">Receive alerts before your streak resets at midnight</p>
                  </div>
                  <input
                    type="checkbox"
                    className="custom-toggle"
                    checked={tempStreak}
                    onChange={(e) => setTempStreak(e.target.checked)}
                  />
                </div>

                <div className="config-item" style={{ marginTop: '1rem' }}>
                  <div>
                    <span className="config-title">Web Push Notifications</span>
                    <p className="config-desc">Browser notifications for new badges and achievements</p>
                  </div>
                  <Button
                    variant={tempPush ? 'secondary' : 'outline'}
                    size="sm"
                    isLoading={isSubscribingPush}
                    onClick={handleEnablePush}
                  >
                    {tempPush ? 'Subscribed ✓' : 'Enable Push 🔔'}
                  </Button>
                </div>
              </div>
              <div className="settings-modal-footer">
                <Button variant="ghost" onClick={() => setIsNotifModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveNotifications}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Learning Language */}
        {isLangModalOpen && (
          <div className="settings-modal-overlay" onClick={() => setIsLangModalOpen(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-header">
                <h2>Select Learning Language 🌐</h2>
                <button className="modal-close-btn" onClick={() => setIsLangModalOpen(false)}>
                  &times;
                </button>
              </div>
              <div className="settings-modal-body">
                <p className="modal-subtitle">Choose your primary language track:</p>
                {isLoadingLanguages ? (
                  <div style={{ padding: '1rem', textAlign: 'center' }}>Loading languages...</div>
                ) : (
                  <div className="lang-options-list">
                    {(languages.length > 0
                      ? languages
                      : [
                          { id: '1', name: 'Japanese', code: 'ja' },
                          { id: '2', name: 'English', code: 'en' },
                        ]
                    ).map((lang) => {
                      const displayTitle = `${lang.name} (${lang.code.toUpperCase()})`;
                      const isSelected = tempLang.toLowerCase().includes(lang.name.toLowerCase());
                      return (
                        <div
                          key={lang.id}
                          className={`lang-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setTempLang(displayTitle)}
                        >
                          <span style={{ fontSize: '1.5rem' }}>
                            {lang.code === 'ja' ? '🇯🇵' : lang.code === 'en' ? '🇬🇧' : '🌐'}
                          </span>
                          <span style={{ fontWeight: 600 }}>{displayTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="settings-modal-footer">
                <Button variant="ghost" onClick={() => setIsLangModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveLanguage}>
                  Set Language
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

