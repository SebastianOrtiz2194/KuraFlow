'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';
import { fetchSearchIndex, searchCatalog, SearchResultItem } from '@/lib/search';
import './Header.css';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  href: string;
  isRead: boolean;
}

export const Header: React.FC = () => {
  const router = useRouter();
  const { currentStreak, profile } = useUser();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'lessons' | 'flashcards'>('all');
  const [catalog, setCatalog] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Popover States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Streak Active 🔥',
      message: 'Keep your momentum going! Complete a lesson today to maintain your streak.',
      time: '1h ago',
      icon: '🔥',
      href: '/lessons',
      isRead: false,
    },
    {
      id: 'n2',
      title: 'SRS Cards Due 🧠',
      message: 'You have flashcards waiting for review in your spaced repetition deck.',
      time: '3h ago',
      icon: '🗂️',
      href: '/flashcards',
      isRead: false,
    },
    {
      id: 'n3',
      title: 'Daily Goal Progress 🎯',
      message: 'Check your daily XP target and climb the leaderboard rankings.',
      time: 'Today',
      icon: '⭐',
      href: '/leaderboard',
      isRead: false,
    },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme synchronization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      window.requestAnimationFrame(() => setTheme(savedTheme));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      window.requestAnimationFrame(() => setTheme('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Load search catalog
  useEffect(() => {
    fetchSearchIndex().then((items) => setCatalog(items));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (streakRef.current && !streakRef.current.contains(event.target as Node)) {
        setIsStreakOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const filteredResults = searchCatalog(catalog, searchQuery, activeFilter);

  // Keyboard shortcut: CMD+K or CTRL+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsStreakOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectResult(filteredResults[selectedIndex]);
      } else if (filteredResults.length > 0) {
        handleSelectResult(filteredResults[0]);
      }
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(item.href);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setIsNotifOpen(false);
    router.push(notif.href);
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const popularTopics = [
    { title: 'Self-Introduction (Jikoshoukai)', type: 'lesson', href: '/lessons' },
    { title: 'Questions with Ka (か)', type: 'lesson', href: '/lessons' },
    { title: 'Negative Sentences', type: 'lesson', href: '/lessons' },
    { title: 'Everyday Essentials Deck', type: 'flashcard', href: '/flashcards' },
    { title: 'JLPT N5 Vocabulary', type: 'flashcard', href: '/flashcards' },
  ];

  return (
    <header className="header glass">
      {/* Search Input & Dropdown */}
      <div className="header-search-container" ref={searchContainerRef}>
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search lessons, flashcards... (Ctrl+K)"
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && (
          <div className="search-dropdown glass-card shadow-lg">
            {/* Filter Tabs */}
            <div className="search-filters">
              <button
                className={`search-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`search-filter-pill ${activeFilter === 'lessons' ? 'active' : ''}`}
                onClick={() => setActiveFilter('lessons')}
              >
                📚 Lessons
              </button>
              <button
                className={`search-filter-pill ${activeFilter === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveFilter('flashcards')}
              >
                🗂️ Flashcards
              </button>
            </div>

            {/* Results List */}
            <div className="search-results-list">
              {searchQuery.trim() === '' ? (
                <div className="search-suggestions">
                  <div className="search-section-label">Popular & Quick Links</div>
                  <div className="suggestions-grid">
                    {popularTopics.map((item, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(item.href);
                        }}
                      >
                        <span className="suggestion-icon">{item.type === 'lesson' ? '📚' : '🗂️'}</span>
                        <span className="suggestion-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <div
                    key={item.id}
                    className={`search-result-item ${selectedIndex === index ? 'is-selected' : ''}`}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="result-icon-col">
                      <span className="result-type-icon">
                        {item.type === 'lesson' ? '📚' : item.type === 'flashcard' ? '🗂️' : '📘'}
                      </span>
                    </div>
                    <div className="result-info-col">
                      <div className="result-title-row">
                        <span className="result-title">{item.title}</span>
                        {item.badgeText && <span className="result-badge">{item.badgeText}</span>}
                      </div>
                      <p className="result-desc">{item.description}</p>
                      <div className="result-meta">
                        <span className="result-cat">{item.category}</span>
                        {item.meta?.xpReward && (
                          <span className="result-xp">+{item.meta.xpReward} XP ⭐</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-empty">
                  <span className="empty-emoji">🔍</span>
                  <p>No results found for &ldquo;<strong>{searchQuery}</strong>&rdquo;</p>
                  <span className="empty-hint">Try searching for keywords like &ldquo;grammar&rdquo;, &ldquo;questions&rdquo;, or &ldquo;vocabulary&rdquo;.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header Top-Right Action Controls */}
      <div className="header-actions">
        {/* Notifications Popover */}
        <div className="header-popover-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsStreakOpen(false);
            }}
          >
            <span className="icon">🔔</span>
            {unreadNotifCount > 0 && <span className="notification-badge" />}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown glass-card shadow-lg">
              <div className="notif-header">
                <div className="notif-title-row">
                  <h3>Notifications</h3>
                  {unreadNotifCount > 0 && (
                    <span className="unread-pill">{unreadNotifCount} new</span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button className="mark-read-btn" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.isRead ? 'is-read' : 'is-unread'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <span className="notif-icon">{notif.icon}</span>
                    <div className="notif-content">
                      <div className="notif-item-title-row">
                        <span className="notif-item-title">{notif.title}</span>
                        <span className="notif-item-time">{notif.time}</span>
                      </div>
                      <p className="notif-item-msg">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notif-footer">
                <Link
                  href="/profile"
                  className="notif-footer-link"
                  onClick={() => setIsNotifOpen(false)}
                >
                  View achievements & badges →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>

        {/* Dynamic Streak Counter & Popover */}
        <div className="header-popover-wrapper" ref={streakRef}>
          <button
            className="streak-counter-btn"
            onClick={() => {
              setIsStreakOpen(!isStreakOpen);
              setIsNotifOpen(false);
            }}
            aria-label="Streak status"
          >
            <span className="streak-icon">🔥</span>
            <span className="streak-value">{currentStreak}</span>
          </button>

          {isStreakOpen && (
            <div className="streak-dropdown glass-card shadow-lg">
              <div className="streak-dropdown-header">
                <span className="streak-hero-fire">🔥</span>
                <h3>{currentStreak} Day Streak</h3>
                <p className="streak-subtitle">
                  {currentStreak > 0
                    ? 'Streak active! Keep practicing daily to build your momentum.'
                    : 'Complete a lesson today to ignite your streak!'}
                </p>
              </div>

              <div className="streak-stats-row">
                <div className="streak-mini-stat">
                  <span className="mini-stat-label">Current</span>
                  <span className="mini-stat-value">{currentStreak} days</span>
                </div>
                <div className="streak-mini-divider" />
                <div className="streak-mini-stat">
                  <span className="mini-stat-label">Longest</span>
                  <span className="mini-stat-value">{profile?.longestStreak || currentStreak} days</span>
                </div>
                <div className="streak-mini-divider" />
                <div className="streak-mini-stat">
                  <span className="mini-stat-label">Freezes</span>
                  <span className="mini-stat-value">{profile?.streakFreezes ?? 1} left</span>
                </div>
              </div>

              <div className="streak-dropdown-action">
                <Button
                  variant="primary"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsStreakOpen(false);
                    router.push('/lessons');
                  }}
                >
                  Continue Learning →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
