export interface SaveProgressRequest {
  score: number;
  xpEarned: number;
}

export async function saveLessonProgress(lessonId: string, data: SaveProgressRequest): Promise<void> {
  try {
    // Determine the base API URL (e.g., from env or fallback to localhost during dev)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    
    // In a real app, the access token would be extracted from an auth context or cookies
    // Here we're simulating the request and passing a dummy user ID header for the backend
    const response = await fetch(`${baseUrl}/progress/lessons/${lessonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': '123e4567-e89b-12d3-a456-426614174000', // Mock UUID for MVP
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
