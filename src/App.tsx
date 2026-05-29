/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCcw,
  BookMarked,
  Award,
  CalendarDays,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

import { UserProgressData, PrepStage, GrandTest } from './types';
import { loadProgressData, saveProgressToLocalStorage, exportUserData } from './utils/storage';
import { initialSubjects } from './initialSyllabus';

import DashboardStats from './components/DashboardStats';
import SubjectTopicsDetail from './components/SubjectTopicsDetail';
import GrandTestTracker from './components/GrandTestTracker';
import TaskPlanner from './components/TaskPlanner';

export default function App() {
  const [data, setData] = useState<UserProgressData>(() => loadProgressData());
  const [activeTab, setActiveTab] = useState<'syllabus' | 'mocks' | 'planner'>('syllabus');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Sync to localstorage every time data changes
  useEffect(() => {
    saveProgressToLocalStorage(data);
  }, [data]);

  // Settings callbacks
  const handleUpdateSettings = (settings: { userName?: string; examDate?: string; dailyGoalHours?: number }) => {
    setData((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  // Syllabus modification callbacks
  const handleUpdateTopicStage = (subjectId: string, topicId: string, stage: PrepStage, value: boolean) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedTopics = sub.topics.map((topic) => {
          if (topic.id !== topicId) return topic;

          return {
            ...topic,
            stages: {
              ...topic.stages,
              [stage]: value,
            },
          };
        });

        return {
          ...sub,
          topics: updatedTopics,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  const handleUpdateTopicPriority = (subjectId: string, topicId: string, priority: 'high' | 'medium' | 'low') => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedTopics = sub.topics.map((topic) => {
          if (topic.id !== topicId) return topic;

          return {
            ...topic,
            priority,
          };
        });

        return {
          ...sub,
          topics: updatedTopics,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  const handleToggleTopicDoubt = (subjectId: string, topicId: string) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedTopics = sub.topics.map((topic) => {
          if (topic.id !== topicId) return topic;

          return {
            ...topic,
            isDoubted: !topic.isDoubted,
          };
        });

        return {
          ...sub,
          topics: updatedTopics,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  const handleUpdateTopicNotes = (subjectId: string, topicId: string, notesText: string) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedTopics = sub.topics.map((topic) => {
          if (topic.id !== topicId) return topic;

          return {
            ...topic,
            notesText,
          };
        });

        return {
          ...sub,
          topics: updatedTopics,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  const handleBulkAction = (subjectId: string, actionType: 'check-all-read' | 'clear-all') => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedTopics = sub.topics.map((topic) => {
          if (actionType === 'check-all-read') {
            return {
              ...topic,
              stages: {
                ...topic.stages,
                read: true,
              },
            };
          } else {
            // clear-all
            return {
              ...topic,
              stages: {
                read: false,
                rev1: false,
                rev2: false,
                mcq: false,
                pyq: false,
                notes: false,
              },
              isDoubted: false,
              notesText: '',
            };
          }
        });

        return {
          ...sub,
          topics: updatedTopics,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Grand Tests callbacks
  const handleAddGrandTest = (newGt: Omit<GrandTest, 'id'>) => {
    const gtWithId: GrandTest = {
      ...newGt,
      id: `gt-${Date.now()}`,
    };

    setData((prev) => ({
      ...prev,
      grandTests: [...prev.grandTests, gtWithId],
    }));
  };

  const handleDeleteGrandTest = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Grand Test record?')) return;
    setData((prev) => ({
      ...prev,
      grandTests: prev.grandTests.filter((gt) => gt.id !== id),
    }));
  };

  // Daily Tasks/Planner callbacks
  const handleAddTask = (title: string, subjectId?: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      subjectId,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setData((prev) => ({
      ...prev,
      dailyTasks: [newTask, ...prev.dailyTasks],
    }));
  };

  const handleToggleTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t) => t.id !== id),
    }));
  };

  const handleClearCompletedTasks = () => {
    setData((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t) => !t.completed),
    }));
  };

  // Backup & Import callbacks
  const handleExportBackup = () => {
    exportUserData(data);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          // Verify critical keys to secure structure
          if (Array.isArray(parsed.subjects) || Array.isArray(parsed.grandTests)) {
            setData(parsed as UserProgressData);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            setImportError('Invalid backup file formatting: subjects/tests missed.');
          }
        } else {
          setImportError('Corrupted file contents.');
        }
      } catch (err) {
        setImportError('Failed to parse file. Ensure it is a valid tracker JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Reset entire workflow back to pristine state
  const handleResetProgress = () => {
    const hasConfirmed = window.confirm(
      '⚠️ CRITICAL WARNING: This will permanently purge your entire study progresses and mock records. Click OK if you wish to reset.'
    );
    if (!hasConfirmed) return;

    setData({
      subjects: JSON.parse(JSON.stringify(initialSubjects)),
      grandTests: [],
      dailyTasks: [],
      examDate: new Date(Date.now() + 10 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      userName: 'Aspirant',
      dailyGoalHours: 8,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased font-sans">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-100/80 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/10 ring-4 ring-blue-50">
              <BookMarked size={19} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-950 font-display tracking-tight leading-none">NEET PG SyllaTrack</h1>
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider mt-0.5 block font-sans">Syllabus Planner</span>
            </div>
          </div>

          {/* Configuration Actions */}
          <div className="flex items-center gap-2">
            {/* Backup export button */}
            <button
              onClick={handleExportBackup}
              className="p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-slate-100"
              title="Export JSON backup data to take offline"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Backup</span>
            </button>

            {/* Custom File Upload Input */}
            <label className="p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-50 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-slate-100">
              <Upload size={14} />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="sr-only"
              />
            </label>

            {/* Total Reset progress button */}
            <button
              onClick={handleResetProgress}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-rose-100"
              title="Reset everything to default templates"
            >
              <RefreshCcw size={14} />
              <span className="hidden sm:inline font-bold">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import Messages feedback */}
        {importError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={15} /> {importError}
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={15} /> Data backup restored successfully. Happy studying!
          </div>
        )}

        {/* Global Dashboard metrics cards */}
        <DashboardStats
          subjects={data.subjects}
          userName={data.userName}
          examDate={data.examDate}
          dailyGoalHours={data.dailyGoalHours}
          onUpdateSettings={handleUpdateSettings}
        />

        {/* Modular Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-inner mb-6">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookMarked size={15} />
            <span>Syllabus Checklist (19 Subjects)</span>
          </button>
          <button
            onClick={() => setActiveTab('mocks')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mocks'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Award size={15} />
            <span>Grand Test & Mock Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CalendarDays size={15} />
            <span>Daily Focus Targets</span>
          </button>
        </div>

        {/* Tab content rendering */}
        <div id="tab-viewport">
          {activeTab === 'syllabus' && (
            <SubjectTopicsDetail
              subjects={data.subjects}
              onUpdateTopicStage={handleUpdateTopicStage}
              onUpdateTopicPriority={handleUpdateTopicPriority}
              onToggleTopicDoubt={handleToggleTopicDoubt}
              onUpdateTopicNotes={handleUpdateTopicNotes}
              onBulkAction={handleBulkAction}
            />
          )}

          {activeTab === 'mocks' && (
            <GrandTestTracker
              grandTests={data.grandTests}
              onAddGrandTest={handleAddGrandTest}
              onDeleteGrandTest={handleDeleteGrandTest}
            />
          )}

          {activeTab === 'planner' && (
            <TaskPlanner
              tasks={data.dailyTasks}
              subjects={data.subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompletedTasks={handleClearCompletedTasks}
            />
          )}
        </div>
      </main>

      {/* Humble, clean outer footer */}
      <footer className="mt-16 border-t border-slate-100 bg-white py-8 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">NEET PG SyllaTrack Checklist Dashboard</p>
          <p className="text-[10px] mt-1 text-slate-300">
            Completely local. Data never leaves your machine. Save backup regularly.
          </p>
        </div>
      </footer>
    </div>
  );
}
