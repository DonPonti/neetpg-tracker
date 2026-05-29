/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, Shield, Star, Zap, CheckCircle2, Trophy, Flame, Play, Volume2 } from 'lucide-react';
import { Subject, GrandTest, DailyTask } from '../types';

interface GamificationXPProps {
  subjects: Subject[];
  grandTests: GrandTest[];
  dailyTasks: DailyTask[];
  currentStreak: number;
}

export default function GamificationXP({ subjects, grandTests, dailyTasks, currentStreak }: GamificationXPProps) {
  
  // Calculate dynamic XP based on physical progress
  const gamificationMetrics = useMemo(() => {
    let checkedStagesCount = 0;
    let totalStagesPossible = 0;
    
    subjects.forEach(sub => {
      sub.topics.forEach(topic => {
        const stagesList = Object.values(topic.stages);
        checkedStagesCount += stagesList.filter(Boolean).length;
        totalStagesPossible += stagesList.length;
      });
    });

    const mockTasksCompleted = dailyTasks.filter(t => t.completed).length;
    const mocksTakenCount = grandTests.length;

    // XP multiplier rules
    const stageXPValue = 20; // 20 XP per completed syllabus task block
    const mockXPValue = 150; // 150 XP per mock test taken
    const plannerXPValue = 30; // 30 XP per planner checkbox
    const streakXPBonus = currentStreak * 45; // Bonus XP for consistency streaks

    const computedXP = (checkedStagesCount * stageXPValue) + 
                       (mocksTakenCount * mockXPValue) + 
                       (mockTasksCompleted * plannerXPValue) + 
                       streakXPBonus;

    // Dynamic level system (each 1000 XP is a level)
    const level = Math.floor(computedXP / 1000) + 1;
    const levelProgressXP = computedXP % 1000;
    const levelPercentage = Math.round((levelProgressXP / 1000) * 100);

    return {
      xp: computedXP,
      level,
      levelProgressXP,
      levelPercentage,
      tasksCompleted: checkedStagesCount,
      mocksTaken: mocksTakenCount,
      plannerCompleted: mockTasksCompleted,
    };
  }, [subjects, grandTests, dailyTasks, currentStreak]);

  // Evaluated badge achievements
  const achievementsList = useMemo(() => {
    const metrics = gamificationMetrics;

    const list = [
      {
        id: 'streak-7',
        name: '7-Day Streak Ignite',
        desc: 'Maintain study consistency for 7 days running.',
        unlocked: currentStreak >= 7,
        icon: <Flame size={18} className="text-orange-400" />,
        unlockedColor: 'border-orange-500/30 bg-orange-500/10 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]',
      },
      {
        id: 'mocks-3',
        name: 'Grand Evaluator',
        desc: 'Complete at least 3 Grand Test mock reviews.',
        unlocked: metrics.mocksTaken >= 3,
        icon: <Trophy size={18} className="text-blue-400" />,
        unlockedColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
      },
      {
        id: 'syllabus-50',
        name: 'Revision Architect',
        desc: 'Log 50+ checklist syllabus milestone checks.',
        unlocked: metrics.tasksCompleted >= 50,
        icon: <Star size={18} className="text-yellow-400" />,
        unlockedColor: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.15)]',
      },
      {
        id: 'level-5',
        name: 'Powerhouse Elite',
        desc: 'Build up XP stats to unlock Candidate Level 5.',
        unlocked: metrics.level >= 5,
        icon: <Shield size={18} className="text-indigo-400" />,
        unlockedColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
      },
    ];
    return list;
  }, [gamificationMetrics, currentStreak]);

  return (
    <div id="gamification-panel" className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden">
      
      {/* Dynamic Profile Level Card */}
      <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between relative overflow-hidden">
        
        {/* Absolute dynamic level watermark */}
        <div className="absolute right-0 bottom-0 text-9xl font-black text-slate-900/40 select-none pointer-events-none translate-y-6 translate-x-4 font-display">
          L{gamificationMetrics.level}
        </div>

        <div className="relative z-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Zap size={13} className="animate-spin text-indigo-400" /> Duolingo Game loop
          </span>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/30">
              {gamificationMetrics.level}
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">Aspirant Rank Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Level {gamificationMetrics.level} Candidate — <span className="text-indigo-400 font-bold">{gamificationMetrics.xp} XP total</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5 px-0.5">
              <span>Dynamic Level Progress</span>
              <span className="font-mono">{gamificationMetrics.levelPercentage}% ({gamificationMetrics.levelProgressXP}/1000 XP)</span>
            </div>
            
            {/* Levelup bar progress */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400 rounded-full transition-all duration-500 relative"
                style={{ width: `${gamificationMetrics.levelPercentage}%` }}
              >
                {/* Glow sheen animation effect */}
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-4 leading-normal relative z-10">
          * Earn <strong className="text-indigo-400">20 XP</strong> for every syllabus stage revision checked off, <strong className="text-blue-400">150 XP</strong> per complete mock, and streak bonuses!
        </p>
      </div>

      {/* Badges Column */}
      <div className="flex-1">
        <h3 className="text-xs font-extrabold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-1.5">
          <Award size={15} className="text-yellow-400" /> Preparation Achievements ({achievementsList.filter(a => a.unlocked).length}/4)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievementsList.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
                badge.unlocked
                  ? badge.unlockedColor
                  : 'bg-slate-950/45 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className={`p-2 rounded-lg border shrink-0 ${
                badge.unlocked ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/20 border-transparent'
              }`}>
                {badge.icon}
              </div>
              
              <div>
                <div className="text-xs font-black">{badge.name}</div>
                <div className="text-[10px] leading-relaxed mt-0.5">{badge.desc}</div>
                
                {badge.unlocked ? (
                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase mt-1 flex items-center gap-0.5 leading-none">
                    <CheckCircle2 size={9} /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase mt-1 block leading-none">
                     LOCKED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
