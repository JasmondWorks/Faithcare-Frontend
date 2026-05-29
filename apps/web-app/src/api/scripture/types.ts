// ── Shared verse & reflection ────────────────────────────────────────────────

import type { BaseEntity } from "../shared/types";

export interface Verse {
  number: number;
  reference: string;
  text: string;
}

export interface ReflectionData {
  theme: string;
  context: string;
  reflectionQuestions: string[];
  prayerPrompt: string;
  application: string;
  memoryVerse: { reference: string; text: string };
}

// ── Daily record ─────────────────────────────────────────────────────────────

export interface UserDailyScripture {
  id: string;
  userId: string;
  title: string;
  scriptureReference: string;
  date: string;
  isCompleted: boolean;
  completedAt: string | null;
  personalNotes: string | null;
  chapterId: string | null;
  bibleId: string | null;
  planDay: number | null;
  createdAt: string;
  updatedAt: string;
}

// ── GET /scripture/today ─────────────────────────────────────────────────────

export interface ChapterData {
  id: string;
  reference: string;
  verses: Verse[];
  nextChapterId: string | null;
  prevChapterId: string | null;
}

export type TodayResponse =
  | {
    type: 'plan';
    dayNumber: number;
    totalDays: number;
    planName: string;
    bibleId: string;
    chapters: ChapterData[];
    reflection: ReflectionData;
    record: UserDailyScripture;
  }
  | {
    type: 'global_verse';
    reference: string;
    chapterId: string;
    text: string;
    version: string;
    record: UserDailyScripture;
  }
  | null;

export interface GlobalTodayResponse extends BaseEntity {
  date: string;
  reference: string;
  text: string;
  version: string;
}

// ── Bible browsing ────────────────────────────────────────────────────────────

export interface Bible {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export interface AudioBible {
  id: string;
  name: string;
  dblId: string;
}

export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
}

export interface BibleChapterSummary {
  id: string;
  number: string;
  reference: string;
}

export interface ChapterContent {
  chapter: {
    bibleId: string;
    chapterId: string;
    reference: string;
    rawHtml: string; // never rendered — use verses[]
    verses: Verse[];
    verseCount: number;
    nextChapterId: string | null;
    prevChapterId: string | null;
  };
  reflection: ReflectionData;
}

export interface AudioChapter {
  chapterId: string;
  reference: string;
  audioUrl: string;
  mimeType: string;
}

// ── Reading plans ─────────────────────────────────────────────────────────────

export type PlanType =
  | 'NT_90'
  | 'PSALMS_30'
  | 'PROVERBS_31'
  | 'GOSPELS_30'
  | 'BIBLE_365';

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  chaptersPerDay: number;
  type: PlanType;
}

export interface UserReadingPlan {
  id: string;
  planId?: string;
  planName: string;
  planDescription?: string;
  totalDays: number;
  currentDay: number;
  progressPercent: number;
  status: 'active' | 'paused' | 'completed';
  translationId: string;
  startDate: string;
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export interface BookmarkedVerse {
  id: string;
  userId: string;
  bibleId: string;
  chapterId: string;
  verseReference: string;
  verseText: string;
  note: string | null;
  createdAt: string;
}

export interface CreateBookmarkRequest {
  bibleId: string;
  chapterId: string;
  verseReference: string;
  verseText: string;
  note?: string;
}
