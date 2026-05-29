import { LeaderboardResponse, UserProfile, ActivityItem } from './types';

export interface SaveProgressRequest {
  score: number;
  xpEarned: number;
}

const API_V1_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const GAMIFICATION_URL = process.env.NEXT_PUBLIC_GAMIFICATION_URL || 'http://localhost:8080/api/gamification';
const USERS_URL = process.env.NEXT_PUBLIC_USERS_URL || 'http://localhost:8080/api/users';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function saveLessonProgress(lessonId: string, data: SaveProgressRequest): Promise<void> {
  try {
    const response = await fetch(`${API_V1_URL}/progress/lessons/${lessonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to save progress:', await response.text());
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export async function getLeaderboard(type: 'weekly' | 'alltime' | 'friends'): Promise<LeaderboardResponse> {
  const response = await fetch(`${GAMIFICATION_URL}/leaderboard/${type}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${GAMIFICATION_URL}/profile/me`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}

export async function getActivityHistory(): Promise<ActivityItem[]> {
  const response = await fetch(`${GAMIFICATION_URL}/profile/me/history`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch activity history');
  return response.json();
}

export async function getUserInfo(): Promise<import('./types').UserInfo> {
  const response = await fetch(`${USERS_URL}/me`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}

export async function followUser(targetId: string): Promise<void> {
  const response = await fetch(`${USERS_URL}/me/following/${targetId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to follow user');
}

export async function unfollowUser(targetId: string): Promise<void> {
  const response = await fetch(`${USERS_URL}/me/following/${targetId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to unfollow user');
}
