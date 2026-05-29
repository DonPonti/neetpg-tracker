/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
  Activity,
  Flame,
  Gauge,
  Info,
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
  const sortedGTsChronological = useMemo(() => {
    return [...grandTests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [grandTests]);

  const sortedGTsNewest = useMemo(() => {
    return [...grandTests].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [grandTests]);

  // Aggregate Performance Stats
  const performanceStats = useMemo(() => {
    if (grandTests.length === 0) return null;

    const scores = grandTests.map(g => g.score);
    const percentiles = grandTests.map(g => g.percentile);

    const maxScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const maxPercentile = Math.max(...percentiles);
    const avgPercentile = Math.round((percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 10) / 10;

    return {
      maxScore,
      avgScore,
      maxPercentile,
      avgPercentile,
      totalTaken: grandTests.length,
    };
  }, [grandTests]);

  // Render progression chart using Recharts
  const renderRechartsGraph = () => {
    if (grandTests.length < 2) {
      return (
        <div className="h-48 bg-slate-950/60 border border-slate-800/85 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <TrendingUp className="text-slate-700 w-8 h-8 mb-2 animate-pulse" />
          <h4 className="text-xs font-black text-slate-400">Unlock Analytical Trend Curves</h4>
          <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
            Log at least 2 Grand Tests to project live scoring curves and dynamic percentile trajectories.
          </p>
        </div>
      );
    }

    const chartData = sortedGTsChronological.map((gt) => ({
      name: gt.testName,
      score: gt.score,
      percentile: gt.percentile,
      date: gt.date,
    }));

    return (
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 shadow-inner">
        <div className="flex justify-between items-center mb-4 px-1">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Activity size={13} className="text-blue-400" /> Score Progression Curve
          </h4>
          <span className="text-[10px] text-slate-500 font-bold font-mono">Max: 800 Marks</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 800]} stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div id="grand-tests-manager" className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Award size={13} className="text-indigo-400" /> Grand Mock Analyzer
          </span>
          <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2 mt-1">
            Grand Test (GT) Performance Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log your NEET PG full-length mock tests to trace scoring graphs, percentile index goals, and weak areas.
          </p>
        </div>

        <button
          id="toggle-add-gt-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-550 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all shrink-0"
        >
          <PlusCircle size={14} /> {showForm ? 'Hide Log Panel' : 'Log Grand Test'}
        </button>
      </div>

      {/* Aggregate metrics subheader row */}
      {performanceStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Peak Marks</div>
              <div className="text-sm font-black text-white mt-1">{performanceStats.maxScore} / 800</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Average Score</div>
              <div className="text-sm font-black text-white mt-1">{performanceStats.avgScore} / 800</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Gauge size={18} />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Peak Percentile</div>
              <div className="text-sm font-black text-white mt-1">{performanceStats.maxPercentile}%</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Info size={18} />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Avg Percentile</div>
              <div className="text-sm font-black text-white mt-1">{performanceStats.avgPercentile}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid container splitting analytical curves and checklist results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Inputs for Form or dynamic graphs) */}
        <div className="lg:col-span-1 space-y-4">
          
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-inner relative z-10">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider pb-1.5 border-b border-slate-900">Enter Mock Score Parameters</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GT 14"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Attempt Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Score (800)</label>
                  <input
                    type="number"
                    min="0"
                    max="800"
                    required
                    placeholder="Marks"
                    value={score}
                    onChange={(e) => setScore(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-white focus:ring-1 focus:ring-blue-500 font-black text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Corrects</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="Counts"
                    value={correctCount}
                    onChange={(e) => setCorrectCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-white focus:ring-1 focus:ring-blue-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Wrongs</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="Counts"
                    value={incorrectCount}
                    onChange={(e) => setIncorrectCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-white focus:ring-1 focus:ring-blue-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Percentile Rank (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 98.7"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value === '' ? '' : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-blue-400 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Weakest Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Pathology, Anatomy"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Strongest Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Pediatrics, Surgery"
                  value={strongAreas}
                  onChange={(e) => setStrongAreas(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Reminders / Review Strategy</label>
                <textarea
                  placeholder="Review gaps identified..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none h-14"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-550 rounded-xl"
                >
                  Save Result
                </button>
              </div>
            </form>
          ) : (
            renderRechartsGraph()
          )}

          {/* Guidelines info */}
          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl relative overflow-hidden">
            <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Info size={13} /> GT Preparation Policy
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
              Doctors securing high ranks emphasize taking at least 15 Grand Tests before the final August date. Focus on limiting WRONG counts to less than <strong className="text-white">35 MCQs</strong> per paper.
            </p>
          </div>

        </div>

        {/* Right column: historical logs list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Chronological log history ({grandTests.length})
          </h3>

          {sortedGTsNewest.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/70 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
              <HelpCircle size={32} className="text-slate-800 mb-2" />
              <h4 className="text-xs font-black text-slate-400">No Grand Mocks Recorded Yet</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
                Ready to take your first GT? Click "Log Grand Test" at the top right to start modeling statistics!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sortedGTsNewest.map((gt) => (
                <div
                  key={gt.id}
                  className="p-4 rounded-2xl border border-slate-850 bg-slate-950/60 transition-all hover:bg-slate-950 flex flex-col justify-between gap-4"
                >
                  
                  {/* Title & basic metrics row */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-xs font-black text-white">{gt.testName}</h4>
                        <span className="text-[9px] bg-slate-905 border border-slate-850 text-slate-400 font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar size={9} /> {new Date(gt.date).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="text-slate-500">Corrects: <strong className="text-emerald-400">{gt.correctCount}</strong></span>
                        <span className="text-slate-550 border-l border-slate-850 pl-3">Wrongs: <strong className="text-rose-400">{gt.incorrectCount}</strong></span>
                        <span className="text-slate-550 border-l border-slate-850 pl-3">Skipped: <strong className="text-slate-400">{gt.unattemptedCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400 font-mono">{gt.score} / 800</div>
                        <div className="text-[9px] text-indigo-400 font-bold font-mono">P: {gt.percentile}%</div>
                      </div>
                      <button
                        onClick={() => onDeleteGrandTest(gt.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Weak and strong areas breakdown */}
                  {(gt.weakAreas.length > 0 || gt.strongAreas.length > 0) && (
                    <div id="subject-trends-box" className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-900">
                      
                      {gt.strongAreas.length > 0 && (
                        <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Strong Fields</span>
                          <div className="flex flex-wrap gap-1.5">
                            {gt.strongAreas.map((area, i) => (
                              <span key={i} className="text-[9px] bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {gt.weakAreas.length > 0 && (
                        <div className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/10">
                          <span className="text-[9px] font-black text-rose-450 uppercase tracking-widest block mb-1">Weak Fields (Gaps)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {gt.weakAreas.map((area, i) => (
                              <span key={i} className="text-[9px] bg-rose-500/10 border border-rose-500/15 text-rose-350 font-bold px-1.5 py-0.5 rounded-md">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* strategy notes highlights */}
                  {gt.notes && (
                    <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-400 italic">
                      Strategy Memo: {gt.notes}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
