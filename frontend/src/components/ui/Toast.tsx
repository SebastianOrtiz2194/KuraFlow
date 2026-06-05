"use client";

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getUserProfile } from '@/lib/api';
import './Toast.css';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  xpReward?: number;
  type: 'badge-earned' | 'info' | 'success';
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  checkNewBadges: () => Promise<void>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pathname = usePathname();

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkNewBadges = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) return;
      const profile = await getUserProfile();
      const badges = profile.badges || [];
      const seenBadgesKey = `kuraflow_seen_badges_${profile.userId || 'default'}`;
      const localSeen = localStorage.getItem(seenBadgesKey);
      
      if (!localSeen) {
        // First load: initialize seen badges with the existing ones
        const initialIds = badges.map((b) => b.badgeId);
        localStorage.setItem(seenBadgesKey, JSON.stringify(initialIds));
        return;
      }
      
      const seenIds: string[] = JSON.parse(localSeen);
      const newBadges = badges.filter((b) => !seenIds.includes(b.badgeId));
      
      if (newBadges.length > 0) {
        newBadges.forEach((badge) => {
          showToast({
            title: `Badge Earned: ${badge.name}!`,
            description: badge.description,
            iconUrl: badge.iconUrl || undefined,
            xpReward: badge.xpReward,
            type: 'badge-earned',
          });
        });
        
        const updatedIds = [...seenIds, ...newBadges.map((b) => b.badgeId)];
        localStorage.setItem(seenBadgesKey, JSON.stringify(updatedIds));
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  }, [showToast]);

  // Set up auto triggers
  useEffect(() => {
    checkNewBadges();

    // Check every 15 seconds
    const interval = setInterval(checkNewBadges, 15000);

    // Check when window gains focus
    const handleFocus = () => {
      checkNewBadges();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname, checkNewBadges]);

  return (
    <ToastContext.Provider value={{ showToast, checkNewBadges }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.iconUrl ? (
                <Image src={toast.iconUrl} alt="Badge" width={32} height={32} />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
              )}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-description">{toast.description}</div>
              {toast.xpReward && (
                <span className="toast-xp">+{toast.xpReward} XP Reward</span>
              )}
            </div>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                opacity: 0.5,
                padding: '0 0.5rem'
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
