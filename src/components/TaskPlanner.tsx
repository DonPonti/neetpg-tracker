/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Plus, CalendarRange, Filter } from 'lucide-react';
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
    <div id="quick-task-planner" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-display">
            <CalendarRange size={20} className="text-blue-600" /> Daily Focus Checklist & Planner
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Break down the mammoth 19 subjects syllabus into bite-sized daily milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column (Create Task) */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddTaskSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Add study goal</h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">What are you studying today?</label>
              <input
                type="text"
                required
                placeholder="e.g. Read Pharyngeal Arches Embryology"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tag Subject (Optional)</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-slate-600"
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
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={14} /> Schedule Target
            </button>
          </form>
        </div>

        {/* Right Columns (Listed Daily Targets) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100 mb-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold select-none">
              {(['active', 'completed', 'all'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`py-1 px-2.5 rounded-md transition-all capitalize ${
                    filterMode === mode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Clear tasks */}
            {tasks.some((t) => t.completed) && (
              <button
                onClick={onClearCompletedTasks}
                className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1 self-end sm:self-auto"
              >
                <Trash2 size={11} /> Clear Finished Goals
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckSquare size={24} className="text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-500">No matching scheduled goals</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5">
                {filterMode === 'active'
                  ? 'All listed targets achieved! Give yourself a tap on the shoulder and schedule some new ones!'
                  : 'No logged goal metrics correspond to this active view category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredTasks.map((task) => {
                const taggedSubject = subjects.find((s) => s.id === task.subjectId);

                return (
                  <div
                    id={`task-item-${task.id}`}
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      task.completed
                        ? 'bg-emerald-50/20 border-emerald-100/50 text-slate-400'
                        : 'bg-white border-slate-100 hover:border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`text-slate-400 hover:text-blue-600 transition-colors shrink-0 ${
                          task.completed ? 'text-emerald-500' : ''
                        }`}
                      >
                        {task.completed ? <CheckSquare size={17} /> : <Square size={17} />}
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold truncate block ${
                            task.completed ? 'line-through text-slate-400 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          {task.title}
                        </span>

                        {taggedSubject && (
                          <span
                            className={`text-[9px] uppercase font-bold tracking-tight rounded px-1.5 py-0.5 mt-0.5 block w-max bg-${taggedSubject.color}-50 text-${taggedSubject.color}-700 border border-${taggedSubject.color}-100/30`}
                            style={{
                              backgroundColor: `var(--color-${taggedSubject.color}-50)`,
                              color: `var(--color-${taggedSubject.color}-700)`,
                              borderColor: `var(--color-${taggedSubject.color}-200)`,
                            }}
                          >
                            {taggedSubject.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete goal"
                    >
                      <Trash2 size={13} />
                    </button>
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
