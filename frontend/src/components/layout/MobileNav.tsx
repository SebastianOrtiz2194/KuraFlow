'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Layers, Trophy, User } from 'lucide-react';
import './MobileNav.css';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Learn', href: '/lessons', icon: BookOpen },
  { label: 'Cards', href: '/flashcards', icon: Layers },
  { label: 'Rank', href: '/leaderboard', icon: Trophy },
  { label: 'Me', href: '/profile', icon: User },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav glass">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="mobile-nav-icon">
              <Icon size={20} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
