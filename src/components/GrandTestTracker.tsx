/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Award,
  Calendar,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Bookmark,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { GrandTest } from '../types';

interface GrandTestTrackerProps {
  grandTests: GrandTest[];
  onAddGrandTest: (gt: Omit<GrandTest, 'id'>) => void;
  onDeleteGrandTest: (id: string) => void;
}

export default function GrandTestTracker({
  grandTests,
  onAddGrandTest,
  onDeleteGrandTest,
}: GrandTestTrackerProps) {
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [testName, setTestName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState<number | ''>('');
  const [correctCount, setCorrectCount] = useState<number | ''>('');
  const [incorrectCount, setIncorrectCount] = useState<number | ''>('');
  const [percentile, setPercentile] = useState<number | ''>('');
  const [weakAreas, setWeakAreas] = useState('');
  const [strongAreas, setStrongAreas] = useState('');
  const [notes, setNotes] = useState('');

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    onAddGrandTest({
      date,
      testName: testName.trim(),
      score: Number(score) || 0,
      correctCount: Number(correctCount) || 0,
      incorrectCount: Number(incorrectCount) || 0,
      unattemptedCount: Math.max(0, 200 - ((Number(correctCount) || 0) + (Number(incorrectCount) || 0))),
      percentile: Number(percentile) || 0,
      weakAreas: weakAreas.split(',').map((s) => s.trim()).filter(Boolean),
      strongAreas: strongAreas.split(',').map((s) => s.trim()).filter(Boolean),
      notes: notes.trim(),
    });

    // Reset Form
    setTestName('');
    setScore('');
    setCorrectCount('');
    setIncorrectCount('');
    setPercentile('');
    setWeakAreas('');
    setStrongAreas('');
    setNotes('');
    setShowForm(false);
  };

  // Sort GTs for plotting & displaying (chronological for graph, newest first for table)
  const sortedGTsChronological = [...grandTests].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const sortedGTsNewest = [...grandTests].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Custom SVG Chart parameters
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 20;

  // Render progression chart if we have at least 2 GTs
  const renderSVGChart = () => {
    if (grandTests.length < 2) {
      return (
        <div className="h-44 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center p-6 text-center">
          <TrendingUp className="text-slate-300 w-8 h-8 mb-2" />
          <h4 className="text-xs font-bold text-slate-500">Not Enough Data for Visual Chart</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Log at least 2 Grand Tests to unlock real-time analytical trend lines.
          </p>
        </div>
      );
    }

    // Determine min and max score to fit the Y-scale
    const scores = sortedGTsChronological.map((g) => g.score);
    const maxScore = Math.max(...scores, 800);
    const minScore = Math.min(...scores, 0);
    const scoreRange = maxScore - minScore || 1;

    // Calculate chart positions
    const points = sortedGTsChronological.map((gt, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (sortedGTsChronological.length - 1);
      const normalizedY = (gt.score - minScore) / scoreRange;
      const y = chartHeight - padding - normalizedY * (chartHeight - 2 * padding);
      return { x, y, score: gt.score, label: gt.testName };
    });

    // Generate path
    let strokePath = '';
    points.forEach((pt, idx) => {
      if (idx === 0) strokePath += `M ${pt.x} ${pt.y}`;
      else strokePath += ` L ${pt.x} ${pt.y}`;
    });

    return (
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <TrendingUp size={14} className="text-blue-600" /> Score Progression Curve (out of 800)
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Chronological list</span>
        </div>

        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto max-h-48 drop-shadow-sm select-none">
            {/* Grids and helper lines */}
            <line
              x1={padding}
              y1={padding}
              x2={chartWidth - padding}
              y2={padding}
              stroke="#f1f5f9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#f1f5f9"
              strokeWidth="1.5"
            />

            {/* Path */}
            <path
              d={strokePath}
              fill="none"
              stroke="url(#chartGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Points and markers */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="3"
                  className="cursor-pointer hover:scale-120 transition-transform animate-pulse"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className="text-[9px] font-extrabold fill-slate-700"
                >
                  {pt.score}
                </text>
                <text
                  x={pt.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[8px] font-semibold fill-slate-400 max-w-[40px] truncate"
                >
                  {pt.label.length > 8 ? pt.label.substring(0, 6) + '..' : pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div id="grand-tests-manager" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-display">
            <Award size={20} className="text-blue-600" /> Grand Test (GT) Performance Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Log your NEET PG full length test performances over time to track scoring graphs and isolate weak areas.
          </p>
        </div>

        <button
          id="toggle-add-gt-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-colors shrink-0"
        >
          <PlusCircle size={14} /> {showForm ? 'Hide Form' : 'Log GT Result'}
        </button>
      </div>

      {/* Grid structure dividing Chart & logged List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Form & Stats or trend chart) */}
        <div className="lg:col-span-1 space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Enter Mock Score</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GT 12"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Attempt Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Score (800)</label>
                  <input
                    type="number"
                    min="0"
                    max="800"
                    placeholder="Marks"
                    value={score}
                    onChange={(e) => setScore(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Corrects</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="Count"
                    value={correctCount}
                    onChange={(e) => setCorrectCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Wrongs (1/4)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="Count"
                    value={incorrectCount}
                    onChange={(e) => setIncorrectCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Percentile (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 98.7"
                    value={percentile}
                    onChange={(e) => setPercentile(e.target.value === '' ? '' : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold text-blue-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Strong Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="Physiology, OBG"
                  value={strongAreas}
                  onChange={(e) => setStrongAreas(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Weak Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="Anatomy, Biochemistry"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Test notes or gaps strategy</label>
                <textarea
                  placeholder="Review: Missed systemic pharmacology, revise ANS."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white h-16 resize-none font-medium text-slate-700"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-[10px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Log Result
                </button>
              </div>
            </form>
          )}

          {renderSVGChart()}
        </div>

        {/* Right Columns (Logged mock table list) */}
        <div className="lg:col-span-2 space-y-3">
          {sortedGTsNewest.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-500">No Grand Tests Logged</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5">
                Keep regular touch with NEET PG full mocks (like Marrow/Prep/Bhatia) and enter your scores here to see improvement.
              </p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white divide-y divide-slate-100">
              {sortedGTsNewest.map((gt) => {
                const totalAttempted = gt.correctCount + gt.incorrectCount;
                const blankQuestions = Math.max(0, 200 - totalAttempted);

                return (
                  <div id={`gt-row-${gt.id}`} key={gt.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-blue-50 text-blue-700 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                          {gt.testName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {new Date(gt.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-xs font-black text-slate-700">{gt.score} <span className="text-[10px] text-slate-400 font-bold">/ 800</span></div>
                          <div className="text-[10px] text-blue-600 font-bold">Percentile: {gt.percentile}%</div>
                        </div>

                        <button
                          onClick={() => onDeleteGrandTest(gt.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete test result"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Correct / Incorrect breakdown bar */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-semibold">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle size={12} /> Corrects: {gt.correctCount} / 200
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <XCircle size={12} /> Wrongs: {gt.incorrectCount} / 200
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <FileText size={12} /> Unattempted: {blankQuestions}
                      </div>
                    </div>

                    {/* Weak subjects & Notes display */}
                    {(gt.weakAreas.length > 0 || gt.strongAreas.length > 0 || gt.notes) && (
                      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100/50 text-[10px] space-y-1.5">
                        {gt.strongAreas.length > 0 && (
                          <div>
                            <span className="font-extrabold text-emerald-700 uppercase">Strong Areas:</span>{' '}
                            <span className="text-slate-600 font-medium">{gt.strongAreas.join(', ')}</span>
                          </div>
                        )}
                        {gt.weakAreas.length > 0 && (
                          <div>
                            <span className="font-extrabold text-rose-700 uppercase">Weak Areas (Needs Review):</span>{' '}
                            <span className="text-slate-600 font-medium">{gt.weakAreas.join(', ')}</span>
                          </div>
                        )}
                        {gt.notes && (
                          <div className="text-slate-500 italic mt-1 bg-white p-1.5 rounded border border-slate-100 font-medium">
                            Strategical Target: {gt.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
