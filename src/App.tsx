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
  Compass,
  Zap,
  Flame,
  LayoutDashboard,
  Brain,
} from 'lucide-react';

import { UserProgressData, PrepStage, GrandTest, StudyLog } from './types';
import { loadProgressData, saveProgressToLocalStorage, exportUserData } from './utils/storage';
import { initialSubjects } from './initialSyllabus';

import DashboardStats from './components/DashboardStats';
import SubjectTopicsDetail from './components/SubjectTopicsDetail';
import GrandTestTracker from './components/GrandTestTracker';
import TaskPlanner from './components/TaskPlanner';
import RankPredictor from './components/RankPredictor';

export default function App() {
  const [data, setData] = useState<UserProgressData>(() => loadProgressData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'syllabus' | 'mocks' | 'predictor' | 'planner'>('dashboard');
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

  // Study log callback for Github contribution heatmap
  const handleAddStudyLog = (log: StudyLog) => {
    setData((prev) => {
      const updatedLogs = [...prev.studyLogs];
      const existingIndex = updatedLogs.findIndex((l) => l.date === log.date);
      if (existingIndex >= 0) {
        updatedLogs[existingIndex] = log;
      } else {
        updatedLogs.push(log);
      }
      return {
        ...prev,
        studyLogs: updatedLogs,
      };
    });
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
          // Verify structure
          if (Array.isArray(parsed.subjects) || Array.isArray(parsed.grandTests)) {
            setData(parsed as UserProgressData);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            setImportError('Invalid backup file structure: components missing.');
          }
        } else {
          setImportError('Empty file provided.');
        }
      } catch (err) {
        setImportError('Failed to parse file. Make sure it is a valid tracker JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Reset entire workflow back to default
  const handleResetProgress = () => {
    const hasConfirmed = window.confirm(
      '⚠️ CRITICAL WARNING: This will permanently purge your entire study progresses, streaks, and mock records. Click OK if you wish to reset.'
    );
    if (!hasConfirmed) return;

    localStorage.removeItem('neet_pg_syllabus_tracker_data_v1');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-500/20 font-sans antialiased flex flex-col lg:flex-row relative">
      
      {/* Background Glow effects */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.04),transparent_45%)] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_60%,rgba(16,185,129,0.03),transparent_40%)] pointer-events-none z-0" />

      {/* ----------------- SIDEBAR CONTAINER (DESKTOP) ----------------- */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-white border-r border-slate-250 p-6 flex-col justify-between sticky top-0 h-screen z-40 shadow-sm select-none">
        <div className="space-y-8">
          
          {/* Brand/logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/15 ring-2 ring-slate-100">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 font-display tracking-wide uppercase leading-none">NEET PG</h1>
              <span className="text-[10px] text-blue-650 font-extrabold tracking-widest uppercase mt-1 block">SyllaTrack Pro</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-550/10 border border-indigo-550/20 flex items-center justify-center text-indigo-650 font-bold font-display text-sm">
                {data.userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate leading-none">{data.userName}</div>
                <span className="text-[9px] text-slate-500 mt-1 block font-mono">August 30, 2026 Target</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Candidate Dashboard', icon: <LayoutDashboard size={15} /> },
              { id: 'syllabus', label: '19 Subjects Syllabus', icon: <BookMarked size={15} /> },
              { id: 'mocks', label: 'Grand Test Analytics', icon: <Award size={15} /> },
              { id: 'predictor', label: 'Rank Predictor', icon: <Compass size={15} /> },
              { id: 'planner', label: 'Daily Focus targets', icon: <CalendarDays size={15} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-blue-600 font-black text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom backup utility dashboard buttons */}
        <div className="space-y-2.5 pt-6 border-t border-slate-200">
          
          <div className="flex gap-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
              title="Download full tracker progress offline parameters"
            >
              <Download size={11} className="text-slate-400" /> Backup
            </button>

            <label className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
              <Upload size={11} className="text-slate-400" /> Import
              <input type="file" accept=".json" onChange={handleImportBackup} className="sr-only" />
            </label>
          </div>

          <button
            onClick={handleResetProgress}
            className="w-full py-1.5 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 text-rose-600 text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCcw size={11} /> Master Reset Tracker
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE BRAND HEADER ----------------- */}
      <header className="lg:hidden bg-white border-b border-slate-200 z-40 sticky top-0 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <Brain size={16} />
          </div>
          <span className="text-xs font-black text-slate-950 font-display uppercase tracking-widest">NEET PG Pro</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold flex items-center gap-1"
          >
            <Download size={10} /> Backup
          </button>
          <button
            onClick={handleResetProgress}
            className="p-1 px-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold"
          >
            Reset
          </button>
        </div>
      </header>

      {/* ----------------- CORE VIEWPORT ----------------- */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full relative z-10 pb-24 md:pb-8">
        
        {/* Error notification banner */}
        {importError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={15} /> {importError}
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={15} /> Candidate backup data synchronized successfully. Let's study!
          </div>
        )}

        {/* ----------------- VIEW SWITCHER ----------------- */}
        <div id="tab-viewport" className="focus:outline-none">
          {activeTab === 'dashboard' && (
            <DashboardStats
              subjects={data.subjects}
              userName={data.userName}
              examDate={data.examDate}
              dailyGoalHours={data.dailyGoalHours}
              studyLogs={data.studyLogs}
              grandTests={data.grandTests}
              dailyTasks={data.dailyTasks}
              onAddStudyLog={handleAddStudyLog}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

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

          {activeTab === 'predictor' && (
            <RankPredictor />
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

        {/* Global humble footer */}
        <footer className="mt-16 border-t border-slate-205 bg-transparent py-8 text-center text-slate-500 text-xs">
          <p className="font-bold text-slate-700">NEET PG SyllaTrack Master Console</p>
          <p className="text-[10px] mt-1 text-slate-500">
            Completely private browser state. Optimized for candidates preparing for official NBEMS schedules.
          </p>
        </footer>
      </main>

      {/* ----------------- MOBILE NAVIGATION BAR (STICKY BOTTOM) ----------------- */}
      <div className="lg:hidden fixed bottom-5 left-4 right-4 bg-white/95 border border-slate-200 backdrop-blur-md h-16 rounded-2xl flex items-center justify-around z-50 shadow-lg px-2">
        {[
          { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
          { id: 'syllabus', label: 'Syllabus', icon: <BookMarked size={18} /> },
          { id: 'mocks', label: 'Mocks', icon: <Award size={18} /> },
          { id: 'predictor', label: 'Rank', icon: <Compass size={18} /> },
          { id: 'planner', label: 'Planner', icon: <CalendarDays size={18} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 transition-all ${
                isActive ? 'text-blue-650 font-extrabold scale-110' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] mt-1 font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
