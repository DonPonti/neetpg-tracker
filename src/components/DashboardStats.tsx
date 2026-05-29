/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Calendar, BookOpen, Clock, Settings, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { Subject, PrepStage } from '../types';

interface DashboardStatsProps {
  subjects: Subject[];
  userName: string;
  examDate: string;
  dailyGoalHours: number;
  onUpdateSettings: (settings: { userName?: string; examDate?: string; dailyGoalHours?: number }) => void;
}

export default function DashboardStats({
  subjects,
  userName,
  examDate,
  dailyGoalHours,
  onUpdateSettings,
}: DashboardStatsProps) {
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempDate, setTempDate] = useState(examDate);
  const [tempHours, setTempHours] = useState(dailyGoalHours);

  // Math/Analytics
  const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);

  const getStageCount = (stage: PrepStage) => {
    return subjects.reduce((acc, sub) => {
      return acc + sub.topics.filter((topic) => topic.stages[stage]).length;
    }, 0);
  };

  const getCompletenessPercent = () => {
    if (totalTopics === 0) return 0;
    // Weighted progress across all stages
    // e.g., read = 25%, rev1 = 20%, rev2 = 15%, mcq = 15%, pyq = 15%, notes = 10%
    const read = getStageCount('read');
    const rev1 = getStageCount('rev1');
    const rev2 = getStageCount('rev2');
    const mcq = getStageCount('mcq');
    const pyq = getStageCount('pyq');
    const notes = getStageCount('notes');

    const totalScore =
      read * 0.25 + rev1 * 0.2 + rev2 * 0.15 + mcq * 0.15 + pyq * 0.15 + notes * 0.1;
    return Math.round((totalScore / totalTopics) * 100);
  };

  const progressPercent = getCompletenessPercent();

  // Days remaining calculation
  const getDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      userName: tempName.trim() || 'Aspirant',
      examDate: tempDate,
      dailyGoalHours: Math.max(1, Math.min(24, tempHours)),
    });
    setIsEditingSettings(false);
  };

  const stagesDef: { key: PrepStage; label: string; color: string; desc: string }[] = [
    { key: 'read', label: 'First Read', color: 'bg-emerald-500', desc: 'Core study' },
    { key: 'rev1', label: 'Revision 1', color: 'bg-indigo-500', desc: 'First review' },
    { key: 'rev2', label: 'Revision 2', color: 'bg-cyan-500', desc: 'Mock prep' },
    { key: 'mcq', label: 'MCQs Checked', color: 'bg-blue-500', desc: 'Question bank' },
    { key: 'pyq', label: 'PYQs Mastered', color: 'bg-rose-500', desc: 'Previous years' },
    { key: 'notes', label: 'Short Notes', color: 'bg-amber-500', desc: 'Condensed summaries' },
  ];

  return (
    <div id="dashboard-stats-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Profile & Overall Progress */}
      <div id="overall-progress-card" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NEET PG Candidate</span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
              <button
                id="edit-settings-btn"
                onClick={() => {
                  setTempName(userName);
                  setTempDate(examDate);
                  setTempHours(dailyGoalHours);
                  setIsEditingSettings(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                title="Edit Settings"
              >
                <Edit3 size={15} />
              </button>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <Award size={20} />
          </div>
        </div>

        {isEditingSettings ? (
          <form id="settings-edit-form" onSubmit={handleSaveSettings} className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Target Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Your Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">NEET PG Exam Date</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Daily Study Target (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={tempHours}
                  onChange={(e) => setTempHours(parseInt(e.target.value) || 8)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSettings(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Plan
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-6 mt-4">
            {/* Visual Circular Gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-95">
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
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-2xl font-extrabold text-slate-950 leading-none font-display">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Complete</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Weighted Readiness</span>
                <span className="font-extrabold text-blue-650">{progressPercent}/100</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Overall score calculated dynamically. Full credit demands completing both reads and mock checks!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 flex items-center gap-2">
            <BookOpen size={16} className="text-slate-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase leading-none">Total Topics</div>
              <div className="text-sm font-bold text-slate-700 mt-0.5">{totalTopics}</div>
            </div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase leading-none">Daily Plan</div>
              <div className="text-sm font-bold text-slate-700 mt-0.5">{dailyGoalHours} hr/day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Widget */}
      <div id="countdown-card" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam Countdown</span>
            <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle size={12} /> NBEMS Official Schedule
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2">
            {daysRemaining > 0 ? (
              <>
                <span className="text-5xl font-extrabold text-slate-800 tracking-tight">{daysRemaining}</span>
                <span className="text-lg font-bold text-slate-400 uppercase">Days Left</span>
              </>
            ) : daysRemaining === 0 ? (
              <span className="text-3xl font-bold text-emerald-600">Exam is Today!</span>
            ) : (
              <span className="text-2xl font-bold text-slate-400">Exam Date Passed</span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Target date: <strong className="text-slate-600 font-medium">{new Date(examDate).toLocaleDateString(undefined, {
              dateStyle: 'long',
            })}</strong>.
          </p>

          <p className="text-[11px] text-slate-400 mt-1 pb-2 border-b border-slate-100/60 leading-relaxed">
            NEET PG 2026 is officially scheduled by the <strong className="text-slate-600 font-semibold text-xs">National Board of Examinations in Medical Sciences (NBEMS)</strong> to be conducted on <strong className="text-blue-600 font-bold">August 30, 2026</strong>.
          </p>

          {examDate !== '2026-08-30' && (
            <div className="mt-2.5 p-2 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] text-blue-800 font-medium leading-normal">
                Your current target date is set to <strong>{examDate}</strong>. Sync your tracker with the official NBEMS schedule?
              </span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ examDate: '2026-08-30' })}
                className="w-full py-1 text-[10px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors text-center cursor-pointer"
              >
                Sync with Official Exam Date
              </button>
            </div>
          )}
        </div>

        {/* Motivational Quote or stats */}
        <div className="bg-amber-50/50 border border-amber-100/50 p-3.5 rounded-xl mt-4">
          <div className="flex gap-2.5">
            <Calendar size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-800">Exam Strategy Guidance</h4>
              <p className="text-[11px] text-amber-700/90 leading-normal mt-0.5">
                {daysRemaining > 150
                  ? "Great runway! Finish your first detailed read of all 19 subjects. Do not skip pre-clinical anatomy."
                  : daysRemaining > 60
                  ? "Revision 1 should be in full swing. Solidify high-yield PYQs and focus heavily on pathology/pharmacology."
                  : daysRemaining > 0
                  ? "Deep Revision 2. Clear out your doubt marked list and write at least 2 full Grand Tests every week."
                  : "Keep tracker loaded for diagnostic evaluations."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Stages Completion Grid */}
      <div id="prep-stages-card" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">Preparation Stages</span>

        <div className="grid grid-cols-1 gap-3">
          {stagesDef.map((stage) => {
            const completedCount = getStageCount(stage.key);
            const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

            return (
              <div id={`stage-${stage.key}-vrow`} key={stage.key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <span>{stage.label}</span>
                  </div>
                  <span className="font-semibold text-slate-500">
                    {completedCount}/{totalTopics} <span className="text-[10px] text-slate-400">({percentage}%)</span>
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
  );
}
