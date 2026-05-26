import { LeaderboardResponse, UserProfile } from './types';

export interface SaveProgressRequest {
  score: number;
  xpEarned: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
    const response = await fetch(`${BASE_URL}/progress/lessons/${lessonId}`, {
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

export async function getLeaderboard(type: 'weekly' | 'alltime'): Promise<LeaderboardResponse> {
  const response = await fetch(`${BASE_URL}/gamification/leaderboard/${type}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/gamification/profile/me`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}
