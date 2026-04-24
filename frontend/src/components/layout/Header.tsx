'use client';

import React, { useEffect, useState } from 'react';
import './Header.css';

export const Header: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  return (
    <header className="header glass">
      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search lessons, flashcards..." className="search-input" />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <span className="icon">🔔</span>
          <span className="notification-badge" />
        </button>
        <button 
          className="icon-btn theme-toggle" 
          onClick={toggleTheme}
          aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
          <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>
        <div className="streak-counter">
          <span className="streak-icon">🔥</span>
          <span className="streak-value">12</span>
        </div>
      </div>
    </header>
  );
};
