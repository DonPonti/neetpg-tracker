/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, HelpCircle, ShieldAlert, Sparkles, TrendingUp, CheckCircle, Lightbulb, RefreshCw, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RankPredictor() {
  const [gtScore, setGtScore] = useState<number>(152); // Out of 200 questions correctly answered
  const [percentile, setPercentile] = useState<number>(96.8);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gtsAttempted, setGtsAttempted] = useState<number>(8);
  const [trendDirection, setTrendDirection] = useState<'up' | 'stable' | 'down'>('up');

  // Interactive predictions
  const predictions = useMemo(() => {
    // Standard NEET PG candidate volume is ~200,000 to 220,000
    const candidateVolume = 220000;
    
    // Core predictive logic
    const baseRank = Math.max(1, Math.round((100 - percentile) * (candidateVolume / 100)));
    
    // Adjust rank slightly based on simulated difficulty and trends
    let difficultyMultiplier = 1.0;
    if (difficulty === 'easy') difficultyMultiplier = 1.05; // harder to get top rank
    if (difficulty === 'hard') difficultyMultiplier = 0.92; // low cut-off benefits toppers
    
    let trendMultiplier = 1.0;
    if (trendDirection === 'up') trendMultiplier = 0.95; // positive projection
    if (trendDirection === 'down') trendMultiplier = 1.08; 

    const predictedAir = Math.round(baseRank * difficultyMultiplier * trendMultiplier);
    
    const bestCase = Math.max(1, Math.round(predictedAir * 0.72));
    const worstCase = Math.round(predictedAir * 1.35 + 80);

    // Confidence index formula
    const confidenceScore = Math.min(99, Math.round(
      35 + 
      (gtsAttempted * 4.5) + 
      (percentile > 92 ? 18 : 10) - 
      (trendDirection === 'stable' ? 2 : 0)
    ));

    return {
      air: predictedAir,
      bestCase,
      worstCase,
      confidenceScore,
    };
  }, [percentile, difficulty, gtsAttempted, trendDirection]);

  // Counseling estimator specialties
  const specialties = useMemo(() => {
    const air = predictions.air;
    const list = [
      { name: 'MD Radio-Diagnosis', cutoff: 2200, group: 'Clinical' },
      { name: 'MD Dermatology', cutoff: 3100, group: 'Clinical' },
      { name: 'MD General Medicine', cutoff: 4600, group: 'Clinical' },
      { name: 'MD Pediatrics', cutoff: 6200, group: 'Clinical' },
      { name: 'MS Orthopedics', cutoff: 8500, group: 'Clinical' },
      { name: 'MS General Surgery', cutoff: 11500, group: 'Clinical' },
      { name: 'MD Obstetrics & Gynecology', cutoff: 13200, group: 'Clinical' },
      { name: 'MD Ophthalmology', cutoff: 16000, group: 'Para-clinical' },
      { name: 'MD Pathology', cutoff: 28000, group: 'Para-clinical' },
    ];

    return list.map(spec => {
      let status: 'High' | 'Borderline' | 'Low' = 'High';
      let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      
      if (air > spec.cutoff * 1.25) {
        status = 'Low';
        colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      } else if (air > spec.cutoff * 0.85) {
        status = 'Borderline';
        colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      }

      return {
        ...spec,
        status,
        colorClass,
      };
    });
  }, [predictions.air]);

  // Mock score trajectory dataset
  const mockTrajectory = useMemo(() => {
    const points = [];
    let curScore = gtScore - 15;
    for (let i = 1; i <= gtsAttempted; i++) {
      curScore += Math.floor(Math.random() * 8) - 1;
      points.push({
        name: `GT ${i}`,
        score: Math.min(200, Math.max(0, Math.round(curScore))),
        predictedRank: Math.max(10, Math.round((200 - curScore) * 1100)),
      });
    }
    // ensure last is exact match
    if (points.length > 0) {
      points[points.length - 1].score = gtScore;
    }
    return points;
  }, [gtScore, gtsAttempted]);

  return (
    <div id="rank-predictor-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Settings / Inputs Form */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Sparkles size={13} className="animate-pulse" /> Statistical Model
          </span>
          <h2 className="text-lg font-extrabold text-white font-display">Diagnostic Rank Engine</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Specify your recent mock stats to compute estimated All India Ranks based on standard distribution bell curves.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-400">GT Score (Correct of 200)</label>
                <span className="text-xs font-bold text-blue-400 font-mono">{gtScore} Qs / 200</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={gtScore}
                onChange={(e) => setGtScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-400">GT Percentile</label>
                <span className="text-xs font-bold text-indigo-400 font-mono">{percentile}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="99.9"
                step="0.1"
                value={percentile}
                onChange={(e) => setPercentile(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">GT Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200"
                >
                  <option value="easy">Easy (Higher cutoff)</option>
                  <option value="medium">Medium Standards</option>
                  <option value="hard">Hard (Low cutoff)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">GTs Attempted</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={gtsAttempted}
                  onChange={(e) => setGtsAttempted(parseInt(e.target.value) || 8)}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Preparation Trajectory</label>
              <div className="grid grid-cols-3 gap-2">
                {(['up', 'stable', 'down'] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setTrendDirection(dir)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all uppercase ${
                      trendDirection === dir
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {dir === 'up' ? '📈 Climbing' : dir === 'stable' ? '➡️ Flat' : '📉 Slipping'}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Confidence level meter */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1"><HelpCircle size={13} /> Prediction Reliability</span>
            <span className="font-extrabold text-white font-mono">{predictions.confidenceScore}%</span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                predictions.confidenceScore > 80
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : predictions.confidenceScore > 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400'
              }`}
              style={{ width: `${predictions.confidenceScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
            {predictions.confidenceScore > 80 
              ? "Highly reliable. Attempting >8 GT mocks provides a highly stable evaluation database." 
              : "Increase your Grand Test count to cross-verify core score predictions with higher precision."}
          </p>
        </div>
      </div>

      {/* outputs & predictions visualizations */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl lg:col-span-2 flex flex-col justify-between">
        
        {/* Predictive Output Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-800">
          
          <div className="bg-gradient-to-br from-blue-650/20 to-indigo-650/10 border border-blue-500/20 p-5 rounded-2xl text-center relative overflow-hidden">
            <div className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest combo">Estimated AIR Range</div>
            <div className="text-3xl font-black text-white mt-2 font-display">
              {predictions.air > 500 ? (
                <>
                  {Math.round(predictions.air * 0.95)} <span className="text-xs text-slate-400">to</span> {Math.round(predictions.air * 1.05)}
                </>
              ) : (
                predictions.air
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">All India Rank projection</div>
            <div className="absolute top-1 right-1 opacity-20"><TrendingUp size={28} /></div>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center flex flex-col justify-center">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Optimistic Ceiling</div>
            <div className="text-2xl font-black text-white mt-1.5 font-display">AIR {predictions.bestCase}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Best rank chance</div>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center flex flex-col justify-center">
            <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Risk Scenario</div>
            <div className="text-2xl font-black text-white mt-1.5 font-display">AIR {predictions.worstCase}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Worst case cutoff</div>
          </div>
        </div>

        {/* Specialty Admission Estimation counseling matrix */}
        <div className="mt-6 flex-1">
          <h3 className="text-xs font-extrabold text-slate-300 mb-3.5 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-indigo-400" /> Specialty Seat Allotment Estimator (Counselling Forecast)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-56 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
            {specialties.map((spec) => (
              <div key={spec.name} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{spec.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Cut-off limit: ~{spec.cutoff} AIR</div>
                </div>
                
                <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-2 py-1 rounded-lg ${spec.colorClass}`}>
                  {spec.status === 'High' ? '👍 High Chance' : spec.status === 'Borderline' ? '⚖️ Borderline' : '⚠️ Tough'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Guidance Quote */}
        <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl mt-6">
          <div className="flex gap-2">
            <Lightbulb size={17} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-normal">
              {predictions.air < 5000 
                ? "Excellent mock curve! Keep up subject revision blocks. Secure Clinical specialties in leading central institutes." 
                : predictions.air < 15000 
                ? "You are highly competitive. Focus on Para-pre Clinical disciplines or target high-yield revisions to break into sub-5000 ranks." 
                : "Continuous high MCQ volumes are needed. Target weak performance zones on upcoming Grand Tests."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
