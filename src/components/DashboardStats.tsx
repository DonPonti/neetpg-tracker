/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Award, Calendar, BookOpen, Clock, Settings, CheckCircle2, AlertCircle, Edit3, Sparkles } from 'lucide-react';
import { Subject, PrepStage, StudyLog, GrandTest, DailyTask } from '../types';
import StudyHeatmap from './StudyHeatmap';
import GamificationXP from './GamificationXP';

interface DashboardStatsProps {
  subjects: Subject[];
  userName: string;
  examDate: string;
  dailyGoalHours: number;
  studyLogs: StudyLog[];
  grandTests: GrandTest[];
  dailyTasks: DailyTask[];
  onAddStudyLog: (log: StudyLog) => void;
  onUpdateSettings: (settings: { userName?: string; examDate?: string; dailyGoalHours?: number }) => void;
}

export default function DashboardStats({
  subjects,
  userName,
  examDate,
  dailyGoalHours,
  studyLogs,
  grandTests,
  dailyTasks,
  onAddStudyLog,
  onUpdateSettings,
}: DashboardStatsProps) {
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempDate, setTempDate] = useState(examDate);
  const [tempHours, setTempHours] = useState(dailyGoalHours);

  // Stats calculation
  const totalTopics = useMemo(() => {
    return subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  }, [subjects]);

  const getStageCount = (stage: PrepStage) => {
    return subjects.reduce((acc, sub) => {
      return acc + sub.topics.filter((topic) => topic.stages[stage]).length;
    }, 0);
  };

  const currentStreak = useMemo(() => {
    // Basic streak check for gamification integration
    const activeDates = new Set(
      studyLogs.filter(l => l.hours > 0).map(l => l.date)
    );
    let streak = 0;
    let checkDate = new Date();
    let keepChecking = true;
    const todayStr = new Date().toISOString().split('T')[0];

    while (keepChecking) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        const isToday = checkStr === todayStr;
        if (isToday) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (activeDates.has(yesterdayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            keepChecking = false;
          }
        } else {
          keepChecking = false;
        }
      }
    }
    return streak || (activeDates.has(todayStr) ? 1 : 0);
  }, [studyLogs]);

  const progressPercent = useMemo(() => {
    if (totalTopics === 0) return 0;
    const read = getStageCount('read');
    const rev1 = getStageCount('rev1');
    const rev2 = getStageCount('rev2');
    const mcq = getStageCount('mcq');
    const pyq = getStageCount('pyq');
    const notes = getStageCount('notes');

    const totalScore =
      read * 0.25 + rev1 * 0.2 + rev2 * 0.15 + mcq * 0.15 + pyq * 0.15 + notes * 0.1;
    return Math.round((totalScore / totalTopics) * 100);
  }, [subjects, totalTopics]);

  const daysRemaining = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [examDate]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      userName: tempName.trim() || 'Aspirant',
      examDate: tempDate,
      dailyGoalHours: Math.max(1, Math.min(24, tempHours)),
    });
    setIsEditingSettings(false);
  };

  const stagesDef: { key: PrepStage; label: string; color: string; hoverGlow: string }[] = [
    { key: 'read', label: 'First Read', color: 'bg-emerald-500', hoverGlow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
    { key: 'rev1', label: 'Revision 1', color: 'bg-indigo-500', hoverGlow: 'shadow-[0_0_8px_rgba(99,102,241,0.3)]' },
    { key: 'rev2', label: 'Revision 2', color: 'bg-cyan-500', hoverGlow: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]' },
    { key: 'mcq', label: 'MCQs Solved', color: 'bg-blue-500', hoverGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
    { key: 'pyq', label: 'PYQs Mastered', color: 'bg-rose-500', hoverGlow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]' },
    { key: 'notes', label: 'Short Notes', color: 'bg-amber-500', hoverGlow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]' },
  ];

  return (
    <div className="space-y-6">

      {/* Profile, Countdown & Stage Progress Block Grid */}
      <div id="dashboard-general-blocks" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Candidate Profile Info card with radial progress */}
        <div id="overall-progress-card" className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block font-mono">NEET PG 2026 Profile</span>
              <div className="flex items-center gap-2 mt-1.5">
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">{userName}</h2>
                <button
                  onClick={() => {
                    setTempName(userName);
                    setTempDate(examDate);
                    setTempHours(dailyGoalHours);
                    setIsEditingSettings(true);
                  }}
                  className="p-1 px-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
                  title="Modify target parameters"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>

          {isEditingSettings ? (
            <form onSubmit={handleSaveSettings} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative z-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Adjust Target profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">NEET PG Exam Date</label>
                  <input
                    type="date"
                    required
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-705 mb-1">Daily Study Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={tempHours}
                    onChange={(e) => setTempHours(parseInt(e.target.value) || 8)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingSettings(false)}
                    className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-550 rounded-lg shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-6 mt-4">
              {/* Radial circle rendering */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#blueGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900 leading-none font-display tracking-tight">{progressPercent}%</span>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Readiness</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-550">Completion Index</span>
                  <span className="text-blue-650 font-mono">{progressPercent}/100</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Weighted readiness aggregates. Double revisions and Grand Tests are factored in to secure peak status scores.
                </p>
              </div>
            </div>
          )}

          {/* Micro analytics sub row */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-200">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 flex items-center gap-2">
              <BookOpen size={15} className="text-blue-600 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-405 font-bold uppercase leading-none">Subjects Log</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">{totalTopics} major topics</div>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 flex items-center gap-2">
              <Clock size={15} className="text-indigo-600 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-405 font-bold uppercase leading-none">Daily Plan</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">{dailyGoalHours} hr / day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Official NBEMS countdown timer */}
        <div id="countdown-card" className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Exam Countdown</span>
              <span className="text-[10px] font-extrabold bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <AlertCircle size={10} /> NBEMS August 30
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-2">
              {daysRemaining > 0 ? (
                <>
                  <span className="text-5xl font-black text-slate-900 tracking-tight font-display">{daysRemaining}</span>
                  <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Days Remaining</span>
                </>
              ) : daysRemaining === 0 ? (
                <span className="text-3xl font-black text-emerald-600">MOCK D-DAY IS TODAY!</span>
              ) : (
                <span className="text-2xl font-black text-slate-400">EXAM DATE PASSED</span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Target schedule date: <strong className="text-slate-800 font-semibold">{new Date(examDate).toLocaleDateString(undefined, {
                dateStyle: 'long',
              })}</strong>.
            </p>

            <p className="text-[10px] text-slate-400 mt-1 pb-3 border-b border-slate-200 leading-relaxed">
              NEET PG 2026 is officially scheduled by the <strong className="text-slate-500 font-bold text-[11px]">NBEMS</strong> to be conducted on <span className="text-blue-600 font-extrabold">August 30, 2026</span>.
            </p>

            {examDate !== '2026-08-30' && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-105 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[9px] text-blue-700 font-medium leading-normal">
                  Your config is targetted to {examDate}. Reset to NBEMS official date?
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ examDate: '2026-08-30' })}
                  className="px-2.5 py-1 text-[9px] font-black text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  Sync Official
                </button>
              </div>
            )}
          </div>

          {/* Strategy pointer cards */}
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl mt-4">
            <div className="flex gap-2.5">
              <Calendar size={18} className="text-amber-650 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-black text-amber-700">Phase Strategy Roadmap</h4>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                  {daysRemaining > 150
                    ? "Great runway! Finish your first detailed read of all 19 subjects. Do not skip pre-clinical anatomy."
                    : daysRemaining > 60
                    ? "Revision 1 should be in full swing. Solidify high-yield PYQs and focus heavily on pathology/pharmacology."
                    : daysRemaining > 0
                    ? "Deep Revision 2. Clear out your doubt marked list and write at least 2 full Grand Tests every week."
                    : "Continuous logging mode."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preparation Checklists linear progress */}
        <div id="prep-stages-card" className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-4 font-mono">Syllabus Milestones</span>

            <div className="grid grid-cols-1 gap-3">
              {stagesDef.map((stage) => {
                const completedCount = getStageCount(stage.key);
                const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

                return (
                  <div key={stage.key} className="space-y-1 hover:opacity-95 transition-opacity">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <div className={`w-2 h-2 rounded-full ${stage.color} ${stage.hoverGlow}`} />
                        <span>{stage.label}</span>
                      </div>
                      <span className="font-extrabold text-slate-500 font-mono text-[11px]">
                        {completedCount}/{totalTopics} <span className="text-[10px] font-bold text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/70">
                      <div
                        className={`${stage.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Gamification Panel */}
      <GamificationXP
        subjects={subjects}
        grandTests={grandTests}
        dailyTasks={dailyTasks}
        currentStreak={currentStreak}
      />

      {/* GitHub-style Study Heatmap */}
      <StudyHeatmap
        studyLogs={studyLogs}
        onAddStudyLog={onAddStudyLog}
        dailyGoalHours={dailyGoalHours}
      />

    </div>
  );
}
