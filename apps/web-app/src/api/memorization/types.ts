export type Grade = 'perfect' | 'hesitant' | 'failed';
export type MemoryStatus = 'learning' | 'reviewing' | 'mastered' | 'archived';
export type Translation = 'KJV' | 'ASV' | 'WEB';

export interface FirstLetterChallenge {
  mode: 'first-letter';
  words: string[];
  prompt: string[];
  reference: string;
}

export interface ClozeChallenge {
  mode: 'cloze';
  segments: Array<{ type: 'word' | 'blank'; value: string; index: number }>;
  reference: string;
  blankCount: number;
}

export interface FullRecallChallenge {
  mode: 'full-recall';
  reference: string;
  wordCount: number;
}

export type PracticeChallenge =
  | FirstLetterChallenge
  | ClozeChallenge
  | FullRecallChallenge;

export interface DueVerseItem {
  verseId: string;
  reference: string;
  text: string;
  interval: number;
  lastGrade: Grade | null;
  challenge: PracticeChallenge;
}

export interface QueueResponse {
  dueCount: number;
  verses: DueVerseItem[];
}

export interface ReviewRequest {
  verseId: string;
  grade: Grade;
  timeSpentSeconds: number;
  reviewedAt?: string;
}

export interface ReviewResponse {
  nextReviewAt: string;
  interval: number;
  status: MemoryStatus;
  streakCount: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface ProgressResponse {
  totalVerses: number;
  mastered: number;
  reviewing: number;
  learning: number;
  currentStreak: number;
  heatmapData: HeatmapEntry[];
  topVerses: Array<{
    verseId: string;
    reference: string;
    translation: string;
    masteredAt: string;
  }>;
}

export interface VerseCollectionItem {
  id: string;
  title: string;
  description: string;
  theme: string;
  isGlobal: boolean;
  verseIds: Array<{
    id: string;
    reference: string;
    text: string;
    translation: string;
  }>;
}

export interface VerseSearchResult {
  text: string;
  reference: string;
  translation: string;
}

export interface GroupStats {
  groupName: string;
  totalVersesMemorized: number;
  activeMembers: number;
  collectiveStreak: number;
  weeklyReviews: number;
}

export interface PendingReview {
  verseId: string;
  grade: Grade;
  timeSpentSeconds: number;
  reviewedAt: string;
}
