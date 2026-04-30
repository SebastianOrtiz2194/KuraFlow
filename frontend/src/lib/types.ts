/**
 * TypeScript interfaces matching the content-service API DTOs.
 * These mirror the Java records in com.kuraflow.content.dto.
 */

export interface LessonContentResponse {
  id: string;
  contentType: 'EXPLANATION' | 'EXAMPLE' | 'QUIZ_MCQ' | 'QUIZ_FILLBLANK' | 'QUIZ_REORDER' | 'AUDIO';
  sortOrder: number;
  title: string | null;
  body: ExplanationBody | ExampleBody | MCQBody | FillInTheBlankBody | ReorderBody | Record<string, unknown>;
}

/** JSONB body shape for QUIZ_MCQ content type */
export interface MCQBody {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/** JSONB body shape for QUIZ_FILLBLANK content type */
export interface FillInTheBlankBody {
  sentence: string; // e.g. "I ___ a student."
  correctAnswer: string;
  explanation?: string;
}

/** JSONB body shape for QUIZ_REORDER content type */
export interface ReorderBody {
  shuffledItems: string[];
  correctItems: string[]; // The items in correct order
  explanation?: string;
}

export interface LessonDetailResponse {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  contents: LessonContentResponse[];
}

export interface LessonResponse {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  sortOrder: number;
  estimatedMinutes: number;
  xpReward: number;
}

/** JSONB body shape for EXPLANATION content type */
export interface ExplanationBody {
  html: string;
  tips?: string[];
}

/** JSONB body shape for EXAMPLE content type */
export interface ExampleBody {
  japanese: string;
  reading?: string;
  pitch_accent?: string | number;
  english: string;
  audio_url?: string;
  notes?: string;
}

/** Furigana annotation pair */
export interface FuriganaPair {
  base: string;
  reading: string;
}

export interface ModuleResponse {
  id: string;
  levelId: string;
  type: string;
  title: string;
  description: string;
  sortOrder: number;
  iconUrl: string | null;
}

export interface LevelResponse {
  id: string;
  languageId: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  totalXpRequired: number;
}

export interface LanguageResponse {
  id: string;
  code: string;
  name: string;
  framework: string;
  isActive: boolean;
}
