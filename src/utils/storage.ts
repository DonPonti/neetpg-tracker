/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, GrandTest, DailyTask, UserProgressData } from '../types';
import { initialSubjects } from '../initialSyllabus';

const STORAGE_KEY = 'neet_pg_syllabus_tracker_data_v1';

// Format date as YYYY-MM-DD
export const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Set default exam date to August 30, 2026, as officially scheduled by NBEMS
const getDefaultExamDate = () => {
  return '2026-08-30';
};

export const loadProgressData = (): UserProgressData => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return {
        subjects: JSON.parse(JSON.stringify(initialSubjects)), // Deep copy
        grandTests: [],
        dailyTasks: [],
        examDate: getDefaultExamDate(),
        userName: 'Aspirant',
        dailyGoalHours: 8,
      };
    }

    const parsed = JSON.parse(rawData);

    // Schema migration / fallback defense
    return {
      subjects: parsed.subjects || JSON.parse(JSON.stringify(initialSubjects)),
      grandTests: parsed.grandTests || [],
      dailyTasks: parsed.dailyTasks || [],
      examDate: parsed.examDate || getDefaultExamDate(),
      userName: parsed.userName || 'Aspirant',
      dailyGoalHours: parsed.dailyGoalHours || 8,
    };
  } catch (error) {
    console.error('Failed to load local data:', error);
    return {
      subjects: JSON.parse(JSON.stringify(initialSubjects)),
      grandTests: [],
      dailyTasks: [],
      examDate: getDefaultExamDate(),
      userName: 'Aspirant',
      dailyGoalHours: 8,
    };
  }
};

export const saveProgressToLocalStorage = (data: UserProgressData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const exportUserData = (data: UserProgressData) => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NEET_PG_Syllabus_Progress_${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};
