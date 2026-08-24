'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import './Sidebar.css';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'Lessons', href: '/lessons', icon: '📚' },
  { label: 'Flashcards', href: '/flashcards', icon: '🗂️' },
  { label: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
  { label: 'Profile', href: '/profile', icon: '👤' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, displayName, avatarInitials, isPro, setProPlan, logout } = useUser();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        footerRef.current &&
        !footerRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTogglePlan = () => {
    const nextState = !isPro;
    setProPlan(nextState);
    showToast({
      title: nextState ? '🎉 Upgraded to Pro!' : 'Switched to Free Plan',
      description: nextState
        ? 'You now have unlimited SRS reviews and AI voice features.'
        : 'Your account is now on the Free tier.',
      type: nextState ? 'success' : 'info',
    });
    setIsPlanModalOpen(false);
  };

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    showToast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
      type: 'info',
    });
    logout();
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="logo" style={{ textDecoration: 'none' }}>
            <span className="logo-icon">🌊</span>
            {!isCollapsed && <span className="logo-text">KuraFlow</span>}
          </Link>
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {isActive && !isCollapsed && <span className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic User Brief Footer */}
        <div className="sidebar-footer" ref={footerRef}>
          <div
            className={`user-brief-btn ${isUserMenuOpen ? 'active' : ''}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            role="button"
            tabIndex={0}
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <div className={`user-avatar ${isPro ? 'pro-avatar' : ''}`}>
              {avatarInitials}
              {isPro && <span className="pro-badge-dot">💎</span>}
            </div>

            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{displayName}</span>
                <span className="user-status">
                  {isPro ? (
                    <span className="pro-status-text">💎 Pro Plan</span>
                  ) : (
                    'Free Plan'
                  )}
                </span>
              </div>
            )}

            {!isCollapsed && <span className="user-menu-chevron">{isUserMenuOpen ? '▲' : '▼'}</span>}
          </div>
        </div>

        {/* User Interactive Menu Popover */}
        {isUserMenuOpen && (
          <div className="user-menu-popover glass-card shadow-lg" ref={menuRef}>
            {/* Header info */}
            <div className="user-menu-header">
              <div className="user-menu-avatar-large">
                {avatarInitials}
              </div>
              <div className="user-menu-details">
                <h4 className="user-menu-name">{displayName}</h4>
                <span className="user-menu-email">{user?.email || 'user@kuraflow.com'}</span>
                <div className="user-menu-plan-pill">
                  {isPro ? (
                    <span className="badge-pro">💎 Pro Member</span>
                  ) : (
                    <span className="badge-free">🌱 Free Learner</span>
                  )}
                </div>
              </div>
            </div>

            <div className="user-menu-divider" />

            {/* Navigation Actions */}
            <div className="user-menu-actions">
              <button
                className="user-menu-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  router.push('/profile');
                }}
              >
                <span className="menu-item-icon">👤</span>
                <div className="menu-item-text">
                  <span className="menu-item-title">My Profile</span>
                  <span className="menu-item-desc">XP, badges & streak history</span>
                </div>
              </button>

              <button
                className="user-menu-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  router.push('/settings');
                }}
              >
                <span className="menu-item-icon">⚙️</span>
                <div className="menu-item-text">
                  <span className="menu-item-title">Settings</span>
                  <span className="menu-item-desc">Preferences & daily goals</span>
                </div>
              </button>

              <button
                className="user-menu-item highlight-plan"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsPlanModalOpen(true);
                }}
              >
                <span className="menu-item-icon">💎</span>
                <div className="menu-item-text">
                  <span className="menu-item-title">{isPro ? 'Manage Pro Plan' : 'Upgrade to Pro'}</span>
                  <span className="menu-item-desc">{isPro ? 'Active benefits' : 'Unlock unlimited SRS'}</span>
                </div>
              </button>
            </div>

            <div className="user-menu-divider" />

            {/* Sign Out Action */}
            <div className="user-menu-footer">
              <button className="user-menu-logout-btn" onClick={handleSignOut}>
                <span className="logout-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Plan / Subscription Modal */}
      {isPlanModalOpen && (
        <div className="plan-modal-overlay" onClick={() => setIsPlanModalOpen(false)}>
          <div className="plan-modal glass-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="plan-modal-header">
              <div className="plan-badge-icon">💎</div>
              <h2>{isPro ? 'Your KuraFlow Pro Plan' : 'Upgrade to KuraFlow Pro'}</h2>
              <p className="plan-modal-subtitle">
                Supercharge your Japanese and English fluency with unlimited practice.
              </p>
              <button
                className="modal-close-btn"
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="plan-features-grid">
              <div className="plan-feature-card">
                <span className="feature-emoji">⚡</span>
                <h4>Unlimited SRS Reviews</h4>
                <p>Review as many spaced repetition flashcards as you want with no daily limits.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">🎙️</span>
                <h4>Native Audio & Furigana</h4>
                <p>High quality native pronunciation samples and adaptive furigana display.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">📈</span>
                <h4>Advanced Analytics</h4>
                <p>Deep breakdown of retention rate, vocabulary mastery, and grammar levels.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">🛡️</span>
                <h4>Streak Saver Protection</h4>
                <p>Automatic streak protection freezes so you never lose your hard-earned streak.</p>
              </div>
            </div>

            <div className="plan-modal-footer">
              <Button
                variant="ghost"
                onClick={() => setIsPlanModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant={isPro ? 'outline' : 'primary'}
                onClick={handleTogglePlan}
              >
                {isPro ? 'Downgrade to Free Plan' : 'Upgrade to Pro (Demo) 🚀'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
