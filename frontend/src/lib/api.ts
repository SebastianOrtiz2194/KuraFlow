import { LeaderboardResponse, UserProfile } from './types';

export interface SaveProgressRequest {
  score: number;
  xpEarned: number;
}

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function saveLessonProgress(lessonId: string, data: SaveProgressRequest): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/progress/lessons/${lessonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': MOCK_USER_ID,
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
      'X-User-Id': MOCK_USER_ID,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}

export async function getUserProfile(userId: string = MOCK_USER_ID): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/gamification/profile/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}
