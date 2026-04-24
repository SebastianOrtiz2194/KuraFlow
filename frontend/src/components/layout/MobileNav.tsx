'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './MobileNav.css';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: 'H' },
  { label: 'Learn', href: '/lessons', icon: 'L' },
  { label: 'Cards', href: '/flashcards', icon: 'C' },
  { label: 'Rank', href: '/leaderboard', icon: 'R' },
  { label: 'Me', href: '/profile', icon: 'M' },
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
