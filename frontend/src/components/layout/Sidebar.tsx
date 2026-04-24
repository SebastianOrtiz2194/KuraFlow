'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'D' },
  { label: 'Lessons', href: '/lessons', icon: 'L' },
  { label: 'Flashcards', href: '/flashcards', icon: 'F' },
  { label: 'Leaderboard', href: '/leaderboard', icon: 'R' },
  { label: 'Profile', href: '/profile', icon: 'P' },
  { label: 'Settings', href: '/settings', icon: 'S' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">K</span>
          {!isCollapsed && <span className="logo-text">KuraFlow</span>}
        </div>
        <button 
          className="collapse-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {isActive && !isCollapsed && <span className="active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-brief">
            <div className="user-avatar">SO</div>
            <div className="user-info">
              <span className="user-name">Sebastian</span>
              <span className="user-status">Free Plan</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
