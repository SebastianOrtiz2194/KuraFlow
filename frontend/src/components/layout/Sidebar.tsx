'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Trophy,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Crown,
  LogOut,
  X,
  Zap,
  Volume2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lessons', href: '/lessons', icon: BookOpen },
  { label: 'Flashcards', href: '/flashcards', icon: Layers },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, avatarInitials, isPro, setProPlan, logout } = useUser();
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
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
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
              {isPro && (
                <span className="pro-badge-dot">
                  <Crown size={10} className="fill-amber-400 text-amber-500" />
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{displayName}</span>
                <span className="user-status">
                  {isPro ? (
                    <span className="pro-status-text">
                      <Sparkles size={11} className="inline mr-1 text-indigo-400" />
                      Pro Plan
                    </span>
                  ) : (
                    'Free Plan'
                  )}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <span className="user-menu-chevron">
                {isUserMenuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            )}
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
                    <span className="badge-pro flex items-center gap-1">
                      <Crown size={12} /> Pro Member
                    </span>
                  ) : (
                    <span className="badge-free">Free Learner</span>
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
                <span className="menu-item-icon">
                  <User size={16} />
                </span>
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
                <span className="menu-item-icon">
                  <Settings size={16} />
                </span>
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
                <span className="menu-item-icon">
                  <Crown size={16} className="text-amber-500" />
                </span>
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
                <LogOut size={16} className="logout-icon" />
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
              <div className="plan-badge-icon">
                <Crown size={24} className="text-amber-500" />
              </div>
              <h2>{isPro ? 'Your KuraFlow Pro Plan' : 'Upgrade to KuraFlow Pro'}</h2>
              <p className="plan-modal-subtitle">
                Supercharge your Japanese and English fluency with unlimited practice.
              </p>
              <button
                className="modal-close-btn"
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="plan-features-grid">
              <div className="plan-feature-card">
                <span className="feature-emoji">
                  <Zap size={20} className="text-amber-500" />
                </span>
                <h4>Unlimited SRS Reviews</h4>
                <p>Review as many spaced repetition flashcards as you want with no daily limits.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">
                  <Volume2 size={20} className="text-indigo-500" />
                </span>
                <h4>Native Audio & Furigana</h4>
                <p>High quality native pronunciation samples and adaptive furigana display.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">
                  <TrendingUp size={20} className="text-emerald-500" />
                </span>
                <h4>Advanced Analytics</h4>
                <p>Deep breakdown of retention rate, vocabulary mastery, and grammar levels.</p>
              </div>

              <div className="plan-feature-card">
                <span className="feature-emoji">
                  <ShieldCheck size={20} className="text-sky-500" />
                </span>
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
                {isPro ? 'Downgrade to Free Plan' : 'Upgrade to Pro (Demo) ✨'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
