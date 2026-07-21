import { LeaderboardResponse, UserProfile, ActivityItem, FlashcardDeckResponse, FlashcardResponse } from './types';

export interface SaveProgressRequest {
  score: number;
  xpEarned: number;
}

export interface UserProgressItem {
  id: string;
  userId: string;
  lessonId: string;
  status: string;
  score: number | null;
  attempts: number;
  xpEarned: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessed: string | null;
}

export interface SrsDueCard {
  id: string;
  userId: string;
  flashcardId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
  lastReviewed: string | null;
  status: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
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
    const response = await fetch(`${API_BASE_URL}/progress/lessons/${lessonId}`, {
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

export async function getUserProgressList(): Promise<UserProgressItem[]> {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user progress');
  return response.json();
}

export async function getSrsDueCards(): Promise<SrsDueCard[]> {
  const response = await fetch(`${API_BASE_URL}/progress/srs/cards/due`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch SRS due cards');
  return response.json();
}

export async function reviewSrsCard(flashcardId: string, quality: number): Promise<SrsDueCard> {
  const response = await fetch(`${API_BASE_URL}/progress/srs/cards/${flashcardId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ quality }),
  });
  if (!response.ok) throw new Error('Failed to review SRS card');
  return response.json();
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

export async function getFlashcardDecks(moduleId: string): Promise<FlashcardDeckResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/flashcards/decks?moduleId=${moduleId}`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch flashcard decks');
  return response.json();
}

export async function getFlashcards(deckId: string): Promise<FlashcardResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/flashcards?deckId=${deckId}&pageSize=100`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch flashcards');
  const data = await response.json();
  return data.content || [];
}

export async function getLanguages(): Promise<import('./types').LanguageResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/languages`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch languages');
  return response.json();
}

export async function getLevels(languageId: string): Promise<import('./types').LevelResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/levels?languageId=${languageId}`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch levels');
  const data = await response.json();
  return data.content || [];
}

export async function getModules(levelId: string): Promise<import('./types').ModuleResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/modules?levelId=${levelId}`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch modules');
  const data = await response.json();
  return data.content || [];
}

export async function getLessons(moduleId: string): Promise<import('./types').LessonResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/lessons?moduleId=${moduleId}`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!response.ok) throw new Error('Failed to fetch lessons');
  const data = await response.json();
  return data.content || [];
}
