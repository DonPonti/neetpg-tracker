/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrepStage = 'read' | 'rev1' | 'rev2' | 'mcq' | 'pyq' | 'notes';

export interface Topic {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  isDoubted: boolean;
  stages: {
    read: boolean;
    rev1: boolean;
    rev2: boolean;
    mcq: boolean;
    pyq: boolean;
    notes: boolean;
  };
  notesText: string;
}

export type SubjectCategory = 'pre-clinical' | 'para-clinical' | 'clinical';

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  color: string; // The base Tailwind color name suffix (e.g., "emerald", "blue")
  topics: Topic[];
}

export interface GrandTest {
  id: string;
  date: string;
  testName: string;
  score: number; // e.g. marks out of 800 or total correct
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  percentile: number;
  weakAreas: string[];
  strongAreas: string[];
  notes: string;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  subjectId?: string;
  topicId?: string;
  dateAdded: string;
}

export interface StudySession {
  id: string;
  date: string;
  durationMinutes: number;
  subjectId: string;
  notes?: string;
}

export interface UserProgressData {
  subjects: Subject[];
  grandTests: GrandTest[];
  dailyTasks: DailyTask[];
  examDate: string;
  userName: string;
  dailyGoalHours: number;
}
