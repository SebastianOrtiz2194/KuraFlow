'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, getUserProfile, getAuthToken } from '@/lib/api';
import type { UserInfo, UserProfile } from '@/lib/types';

interface UserContextType {
  user: UserInfo | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isPro: boolean;
  currentStreak: number;
  displayName: string;
  avatarInitials: string;
  refreshUser: () => Promise<void>;
  setProPlan: (isPro: boolean) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customProState, setCustomProState] = useState<boolean | null>(null);

  const fetchUserData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const [infoData, profileData] = await Promise.all([
        getUserInfo().catch(() => null),
        getUserProfile().catch(() => null),
      ]);

      if (infoData) setUser(infoData);
      if (profileData) setProfile(profileData);

      // Check stored custom plan preference if any
      const savedPro = localStorage.getItem('kuraflow_is_pro');
      if (savedPro !== null) {
        setCustomProState(savedPro === 'true');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    // Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'kuraflow_is_pro') {
        fetchUserData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserData]);

  const displayName = user?.displayName || profile?.displayName || 'Learner';

  const avatarInitials = React.useMemo(() => {
    if (!displayName || displayName === 'Learner') return 'KF';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  const isPro = customProState !== null ? customProState : !!user?.isPremium;

  const setProPlan = (pro: boolean) => {
    setCustomProState(pro);
    localStorage.setItem('kuraflow_is_pro', String(pro));
    if (user) {
      setUser({ ...user, isPremium: pro });
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('kuraflow_is_pro');
    }
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  const currentStreak = profile?.currentStreak ?? 0;

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isPro,
        currentStreak,
        displayName,
        avatarInitials,
        refreshUser: fetchUserData,
        setProPlan,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
