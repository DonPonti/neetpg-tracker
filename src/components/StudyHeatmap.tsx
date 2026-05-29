/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, Calendar, CheckSquare, Sparkles, TrendingUp, Compass, Plus, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StudyLog } from '../types';

interface StudyHeatmapProps {
  studyLogs: StudyLog[];
  onAddStudyLog: (log: StudyLog) => void;
  dailyGoalHours: number;
}

export default function StudyHeatmap({ studyLogs, onAddStudyLog, dailyGoalHours }: StudyHeatmapProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    hours: number;
    mcqs: number;
    subjects: string[];
    revs: number;
    x: number;
    y: number;
  } | null>(null);

  // Form states for quick study sessions
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formHours, setFormHours] = useState(8);
  const [formMcqs, setFormMcqs] = useState(100);
  const [formSubjects, setFormSubjects] = useState('');
  const [formRevs, setFormRevs] = useState(2);

  // Map study logs with quick access O(1)
  const logsMap = useMemo(() => {
    const map: Record<string, StudyLog> = {};
    studyLogs.forEach(log => {
      map[log.date] = log;
    });
    return map;
  }, [studyLogs]);

  // Generate 365-day matrix (53 columns x 7 rows)
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    // We want 364 days total (52 weeks * 7 days) ending on today
    // To align properly, let's find the start date
    const totalDays = 364;
    const startOffset = new Date(today);
    startOffset.setDate(today.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const current = new Date(startOffset);
      current.setDate(startOffset.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const log = logsMap[dateStr];

      days.push({
        date: dateStr,
        dayOfWeek: current.getDay(), // 0 = Sunday, 1 = Monday...
        monthLabel: current.toLocaleDateString('en-US', { month: 'short' }),
        dayOfMonth: current.getDate(),
        hours: log?.hours || 0,
        mcqs: log?.mcqsSolved || 0,
        subjects: log?.subjectsRevised || [],
        revs: log?.revisionsCount || 0,
      });
    }
    return days;
  }, [logsMap]);

  // Group days into columns of 7 elements (weeks)
  const columnsOfWeeks = useMemo(() => {
    const cols = [];
    let currentWeek: typeof heatmapData = [];
    
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });
    return cols;
  }, [heatmapData]);

  // Get month transition headers
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = '';
    
    heatmapData.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (day.monthLabel !== lastMonth) {
        if (!labels.some(l => l.text === day.monthLabel)) {
          labels.push({ text: day.monthLabel, colIndex: weekIndex });
        }
        lastMonth = day.monthLabel;
      }
    });
    return labels;
  }, [heatmapData]);

  // Study statistics calculation
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalMcqs = 0;
    let daysStudied = 0;
    
    // Sort logs to calculate streak
    const sortedLogs = [...studyLogs]
      .filter(l => l.hours > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach(l => {
      totalHours += l.hours;
      totalMcqs += l.mcqsSolved;
      if (l.hours > 0) daysStudied++;
    });

    // Streak logic (Duolingo level game loop)
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Build timeline map of study activity
    const activeDates = new Set(sortedLogs.map(l => l.date));

    // Calculate max streak
    let prevTime: number | null = null;
    const sortedDateStrs = Array.from(activeDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let localStreak = 0;
    let lastDate: Date | null = null;

    sortedDateStrs.forEach((dateS) => {
      const curD = new Date(dateS);
      if (!lastDate) {
        localStreak = 1;
      } else {
        const diffDays = Math.round((curD.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          localStreak++;
        } else if (diffDays > 1) {
          if (localStreak > maxStreak) maxStreak = localStreak;
          localStreak = 1;
        }
      }
      lastDate = curD;
    });
    if (localStreak > maxStreak) maxStreak = localStreak;

    // Calculate current streak backward from today
    let checkDate = new Date();
    let keepChecking = true;
    while (keepChecking) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow a 1-day grace period for today if it's still early, else break
        const isToday = checkStr === todayStr;
        if (isToday) {
          // Check yesterday
          const checkYesterday = new Date();
          checkYesterday.setDate(checkYesterday.getDate() - 1);
          const checkYesterdayStr = checkYesterday.toISOString().split('T')[0];
          if (activeDates.has(checkYesterdayStr)) {
            // Yes, streak continues, wait for todays study log
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            keepChecking = false;
          }
        } else {
          keepChecking = false;
        }
      }
    }

    const consistencyScore = heatmapData.length > 0 
      ? Math.round((daysStudied / heatmapData.length) * 100) 
      : 0;

    return {
      totalHours,
      totalMcqs,
      daysStudied,
      currentStreak: currentStreak || (activeDates.has(todayStr) ? 1 : 0),
      maxStreak: Math.max(maxStreak, currentStreak),
      consistencyScore,
      averageHours: daysStudied > 0 ? (totalHours / daysStudied).toFixed(1) : '0',
    };
  }, [studyLogs, heatmapData]);

  // Recharts: Aggregating past 7 weeks for mini consistency trend line
  const weeklyTrendData = useMemo(() => {
    // Group heatmap into blocks of 7 days (weeks)
    const reversedWeeks = [...columnsOfWeeks].reverse().slice(0, 8).reverse();
    return reversedWeeks.map((week, index) => {
      const sumMcqs = week.reduce((acc, d) => acc + d.mcqs, 0);
      const sumHours = week.reduce((acc, d) => acc + d.hours, 0);
      const firstDay = week[0]?.date ? new Date(week[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `W${index}`;
      return {
        name: firstDay,
        hours: sumHours,
        mcqs: sumMcqs,
      };
    });
  }, [columnsOfWeeks]);

  const getColorClass = (hours: number) => {
    if (hours === 0) return 'bg-slate-100 hover:bg-slate-200 border border-slate-200';
    if (hours < 4) return 'bg-emerald-100/80 border border-emerald-200/40 text-emerald-900';
    if (hours < 7) return 'bg-emerald-300 border border-emerald-400/50';
    if (hours < 10) return 'bg-emerald-500 border border-emerald-600/40';
    return 'bg-emerald-400 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.45)]';
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectsList = formSubjects
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onAddStudyLog({
      date: formDate,
      hours: formHours,
      mcqsSolved: formMcqs,
      subjectsRevised: subjectsList.length > 0 ? subjectsList : ['General Prep'],
      revisionsCount: formRevs,
    });
    
    setShowLogModal(false);
    // Reset states
    setFormSubjects('');
  };

  return (
    <div id="github-heatmap-section" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      
      {/* Background Mesh Decor */}
      <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={13} className="animate-pulse" /> Consistency Engine
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
            GitHub-Style Study Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing 365 days of active medical revision blocks. Click on any cell or log your stats daily.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus size={15} /> Log Today's Study
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 hover:border-emerald-500/30 transition-all">
          <div className="h-10 w-10 bg-orange-50 text-orange-650 border border-orange-100 rounded-xl flex items-center justify-center relative">
            <Flame size={20} className="animate-bounce" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Streak</div>
            <div className="text-xl font-black text-slate-900 font-display">{stats.currentStreak} Days</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 hover:border-blue-500/30 transition-all">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 border border-blue-105 rounded-xl flex items-center justify-center">
            <Flame size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">All-Time Peak</div>
            <div className="text-xl font-black text-slate-900 font-display">{stats.maxStreak} Days</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 hover:border-emerald-500/30 transition-all">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Time</div>
            <div className="text-xl font-black text-slate-900 font-display">{stats.totalHours} Hours</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 hover:border-indigo-500/30 transition-all">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-650 border border-indigo-100 rounded-xl flex items-center justify-center">
            <CheckSquare size={19} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MCQs Answered</div>
            <div className="text-xl font-black text-slate-900 font-display">{stats.totalMcqs} Qs</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 col-span-2 lg:col-span-1 flex items-center gap-3.5 hover:border-emerald-500/30 transition-all">
          <div className="h-10 w-10 bg-teal-550/10 text-teal-650 border border-teal-100/60 rounded-xl flex items-center justify-center">
            <TrendingUp size={19} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consistency Rating</div>
            <div className="text-xl font-black text-emerald-600 font-display">{stats.consistencyScore}%</div>
          </div>
        </div>
      </div>

      {/* Contribution Calendar Wrapper */}
      <h3 className="text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wide">365-Day Revision Pipeline</h3>
      <div className="relative bg-slate-50 border border-slate-200 p-4 rounded-2xl overflow-x-auto select-none pb-6">
        
        {/* Month headers row */}
        <div className="relative flex gap-1 h-5 mb-1.5 pl-8 text-[9px] font-bold text-slate-500">
          {monthLabels.map((lbl, idx) => (
            <div
              key={idx}
              className="absolute whitespace-nowrap"
              style={{ left: `calc(${lbl.colIndex} * 14px + 32px)` }}
            >
              {lbl.text}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Weekday indicators column */}
          <div className="grid grid-rows-7 gap-1 pr-2.5 text-[9px] font-bold text-slate-400 w-8 h-[98px]">
            <span>Sun</span>
            <span></span>
            <span>Tue</span>
            <span></span>
            <span>Thu</span>
            <span></span>
            <span>Sat</span>
          </div>

          {/* Grid columns of weeks */}
          <div id="heatmap-weeks-container" className="flex gap-1 h-[98px]">
            {columnsOfWeeks.map((week, colIdx) => (
              <div key={colIdx} className="grid grid-rows-7 gap-1">
                {week.map((day, rowIdx) => (
                  <div
                    key={day.date}
                    onClick={() => {
                      setFormDate(day.date);
                      setFormHours(day.hours || 8);
                      setFormMcqs(day.mcqs || 100);
                      setFormSubjects(day.subjects.join(', '));
                      setFormRevs(day.revs || 2);
                      setShowLogModal(true);
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = e.currentTarget.offsetParent?.getBoundingClientRect();
                      setHoveredDay({
                        date: day.date,
                        hours: day.hours,
                        mcqs: day.mcqs,
                        subjects: day.subjects,
                        revs: day.revs,
                        x: rect.left - (parentRect?.left || 0) + 6,
                        y: rect.top - (parentRect?.top || 0) - 100,
                      });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-2.5 h-2.5 rounded-xs transition-transform duration-150 hover:scale-130 hover:z-10 cursor-pointer ${getColorClass(day.hours)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] text-slate-550 mt-4 px-2 leading-none">
          <div>Click any square to retro-log or modify daily statistics</div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-205" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-100" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Floating Custom Tooltip */}
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: hoveredDay.y + 10 }}
              animate={{ opacity: 1, scale: 1, y: hoveredDay.y }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-30 pointer-events-none text-xs w-48 text-left"
              style={{ left: Math.min(hoveredDay.x - 90, 680) }}
            >
              <div className="font-extrabold text-slate-900 text-[11px] pb-1 border-b border-slate-100">
                {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                  dateStyle: 'medium',
                })}
              </div>
              <div className="mt-2 space-y-1 text-slate-650">
                <div className="flex justify-between">
                  <span>Hours studied:</span>
                  <strong className="text-emerald-600 font-bold">{hoveredDay.hours} hr</strong>
                </div>
                <div className="flex justify-between">
                  <span>MCQs solved:</span>
                  <strong className="text-blue-650 font-bold">{hoveredDay.mcqs}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Revisions done:</span>
                  <strong className="text-purple-600 font-bold">{hoveredDay.revs} topics</strong>
                </div>
                {hoveredDay.subjects.length > 0 && (
                  <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 mt-1 truncate">
                    Focused: {hoveredDay.subjects.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Below Heatmap Footer elements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-200">
        
        {/* Left Column: duolingo checkin card */}
        <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-2xl flex flex-col justify-between">
          <div className="flex gap-2 text-slate-600">
            <div className="text-orange-500 shrink-0 mt-0.5">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Percentile Peer Insights</h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                "You revised more than <strong className="text-emerald-600 font-bold font-mono">82%</strong> of active NEET aspirants this month."
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
              <span>Goal consistency speed</span>
              <span>On Flight</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full rounded-full" style={{ width: `${stats.consistencyScore}%` }} />
            </div>
          </div>
        </div>

        {/* Center Column: Weekly Recharts area graph */}
        <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
              <Compass size={13} className="text-blue-500" /> Hourly Trends (8w)
            </h4>
            <span className="text-[9px] font-mono text-slate-400">Weekly Sums</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="glowHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" aria-hidden="true" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '10px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#glowHour)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Mini Bar graph of weekly questions solved */}
        <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
              <Compass size={13} className="text-indigo-500" /> MCQ Volumes (8w)
            </h4>
            <span className="text-[9px] font-mono text-slate-400">Solved / Wk</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '10px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="mcqs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Log Quick Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-extrabold text-slate-900 font-display">Log Study block</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Log your MCQ score, reading speeds & hours for chronological consistency.
                </p>
              </div>

              <form onSubmit={handleSubmitLog} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Study Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      required
                      value={formHours}
                      onChange={(e) => setFormHours(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">MCQs Completed</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      required
                      value={formMcqs}
                      onChange={(e) => setFormMcqs(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Topics Revised</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formRevs}
                      onChange={(e) => setFormRevs(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Subjects Tag (comma separated)</label>
                  <input
                    type="text"
                    value={formSubjects}
                    onChange={(e) => setFormSubjects(e.target.value)}
                    placeholder="e.g. Anatomy, Physiology, OBG"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer"
                  >
                    Commit Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
