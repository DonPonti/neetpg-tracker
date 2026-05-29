/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Plus, CalendarRange, Filter, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { DailyTask, Subject } from '../types';

interface TaskPlannerProps {
  tasks: DailyTask[];
  subjects: Subject[];
  onAddTask: (title: string, subjectId?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompletedTasks: () => void;
}

export default function TaskPlanner({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompletedTasks,
}: TaskPlannerProps) {
  const [taskText, setTaskText] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('active');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    onAddTask(
      taskText.trim(),
      selectedSubjectId === '' ? undefined : selectedSubjectId
    );

    // Reset Form
    setTaskText('');
    setSelectedSubjectId('');
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'active') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    return true; // 'all'
  });

  return (
    <div id="quick-task-planner" className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={13} className="animate-pulse" /> Notion Simplicity
          </span>
          <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2 mt-1">
             Daily Focus Targets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Break down the mammoth 19-subject syllabus into bite-sized daily checkboxes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Left Column (Create Task Container) */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddTaskSubmit} className="bg-slate-950/70 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-inner">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Schedule Study Goal</h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">What are you studying today?</label>
              <input
                type="text"
                required
                placeholder="e.g. Physiology Cardiocycle Diagram"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tag Subject (Optional)</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-800 bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-300 font-bold"
              >
                <option value="">No tagged subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-550 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              <Plus size={14} /> Schedule Target
            </button>
          </form>
        </div>

        {/* Right Columns (Listed Goals/Checkboxes) */}
        <div className="lg:col-span-2 space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/45 p-2 rounded-xl border border-slate-855 mb-2">
            
            {/* Filter tags tab selector */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg text-[10px] font-bold select-none border border-slate-850">
              {(['active', 'completed', 'all'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`py-1 px-3 rounded-md transition-all capitalize cursor-pointer ${
                    filterMode === mode ? 'bg-blue-650 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Clear button if any done */}
            {tasks.some((t) => t.completed) && (
              <button
                onClick={onClearCompletedTasks}
                className="text-[10px] text-rose-450 font-bold hover:underline flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
              >
                <Trash2 size={11} /> Clear Completed Goals
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-850">
              <CheckSquare size={28} className="text-slate-800 mx-auto mb-2" />
              <h4 className="text-xs font-black text-slate-400">No scheduled focus goals</h4>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
                {filterMode === 'active'
                  ? 'All listed targets achieved! Give yourself a tap on the shoulder and schedule some new ones!'
                  : 'No logged focus goal metrics correspond to this active view category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredTasks.map((task) => {
                const taggedSubject = subjects.find((s) => s.id === task.subjectId);

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-950/30 border-slate-900 opacity-60 text-slate-500'
                        : 'bg-slate-950/75 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`transition-colors shrink-0 cursor-pointer ${
                          task.completed ? 'text-blue-500' : 'text-slate-650 hover:text-slate-400'
                        }`}
                      >
                        {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>

                      <div className="min-w-0 pr-2">
                        <span className={`text-xs font-bold leading-normal truncate block ${
                          task.completed ? 'line-through' : 'text-slate-200'
                        }`}>
                          {task.title}
                        </span>
                        
                        {taggedSubject && (
                          <span
                            className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 inline-block border"
                            style={{
                              backgroundColor: `var(--color-${taggedSubject.color}-500, #3b82f6)15`,
                              color: `var(--color-${taggedSubject.color}-400, #60a5fa)`,
                              borderColor: `var(--color-${taggedSubject.color}-500, #3b82f6)20`,
                            }}
                          >
                            {taggedSubject.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick study habits card */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-start gap-3 mt-4">
            <AlertCircle size={16} className="text-amber-450 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-black text-amber-300">Daily Task Planning Tip</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                Limit your daily focus targets of study checklist to <strong className="text-white">3 active goals</strong>. Over-scheduling triggers fatigue, whereas checking off 3 highly impactful revisions builds incredible mental momentum!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
