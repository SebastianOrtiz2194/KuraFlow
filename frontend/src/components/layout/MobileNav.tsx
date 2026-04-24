'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './MobileNav.css';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: '🏠' },
  { label: 'Learn', href: '/lessons', icon: '📚' },
  { label: 'Cards', href: '/flashcards', icon: '🗂️' },
  { label: 'Rank', href: '/leaderboard', icon: '🏆' },
  { label: 'Me', href: '/profile', icon: '👤' },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav glass">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
