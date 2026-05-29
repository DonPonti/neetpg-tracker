/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  FileText,
  Bookmark,
  Sparkles,
  BookMarked,
  Trash2,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { Subject, Topic, SubjectCategory, PrepStage } from '../types';

interface SubjectTopicsDetailProps {
  subjects: Subject[];
  onUpdateTopicStage: (subjectId: string, topicId: string, stage: PrepStage, value: boolean) => void;
  onUpdateTopicPriority: (subjectId: string, topicId: string, priority: 'high' | 'medium' | 'low') => void;
  onToggleTopicDoubt: (subjectId: string, topicId: string) => void;
  onUpdateTopicNotes: (subjectId: string, topicId: string, notes: string) => void;
  onBulkAction: (subjectId: string, actionType: 'check-all-read' | 'clear-all') => void;
}

export default function SubjectTopicsDetail({
  subjects,
  onUpdateTopicStage,
  onUpdateTopicPriority,
  onToggleTopicDoubt,
  onUpdateTopicNotes,
  onBulkAction,
}: SubjectTopicsDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});
  const [editingNotesTopicId, setEditingNotesTopicId] = useState<string | null>(null);
  const [notesBuffer, setNotesBuffer] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [doubtFilter, setDoubtFilter] = useState<boolean>(false);

  // Toggle subject accordion
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjectIds((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  // Check if topic is matched by search
  const isTopicMatched = (topicName: string, query: string) => {
    return topicName.toLowerCase().includes(query.toLowerCase());
  };

  // Render Category styling (Dark mode friendly)
  const getCategoryBadgeColor = (cat: SubjectCategory) => {
    switch (cat) {
      case 'pre-clinical':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'para-clinical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'clinical':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
    }
  };

  const stageKeys: { name: PrepStage; short: string; label: string }[] = [
    { name: 'read', short: 'R', label: 'First Read' },
    { name: 'rev1', short: 'v1', label: 'Revision 1' },
    { name: 'rev2', short: 'v2', label: 'Revision 2' },
    { name: 'mcq', short: 'Q', label: 'MCQs Checked' },
    { name: 'pyq', short: 'Y', label: 'PYQs Mastered' },
    { name: 'notes', short: 'N', label: 'Short Notes' },
  ];

  // Helper to calculate completions
  const getSubjectMetrics = (subject: Subject) => {
    const totalTopicStageChecks = subject.topics.length * 6;
    let completedChecks = 0;
    subject.topics.forEach((topic) => {
      Object.values(topic.stages).forEach((val) => {
        if (val) completedChecks++;
      });
    });

    const completionRate = totalTopicStageChecks > 0 ? Math.round((completedChecks / totalTopicStageChecks) * 100) : 0;
    return { completionRate, totalTopicStageChecks, completedChecks };
  };

  // Pre-process and filter
  const processedSubjects = subjects
    .map((sub) => {
      // Filter topics inside subject
      const filteredTopics = sub.topics.filter((topic) => {
        const matchesSearch = searchQuery === '' || isTopicMatched(topic.name, searchQuery) || sub.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || topic.priority === priorityFilter;
        const matchesDoubt = !doubtFilter || topic.isDoubted;
        return matchesSearch && matchesPriority && matchesDoubt;
      });

      return {
        ...sub,
        topics: filteredTopics,
        hasMatches: filteredTopics.length > 0,
        originalTopicsCount: sub.topics.length,
      };
    })
    // Category filter at subject level
    .filter((sub) => {
      const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
      const displaysProperly = sub.hasMatches && matchesCategory;
      return displaysProperly;
    });

  const handleNotesUpdateSave = (subId: string, topId: string) => {
    onUpdateTopicNotes(subId, topId, notesBuffer);
    setEditingNotesTopicId(null);
  };

  return (
    <div id="syllabus-tracker-core" className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={13} className="animate-pulse" /> 19 Subject Trackers
          </span>
          <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2 mt-1">
            Core Syllabus Checklists
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle preparation stages and write customized reminders. Changes persist inside your web browser.
          </p>
        </div>

        {/* Total stats badge */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-bold px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-450 rounded-xl">
          <Sparkles size={14} className="text-blue-450 animate-pulse" /> Full National Curriculum Catalog
        </div>
      </div>

      {/* Filter Options */}
      <div id="filters-container" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-800">
        
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter size={12} className="text-slate-500" /> Subject Category
          </label>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            {(['all', 'pre-clinical', 'para-clinical', 'clinical'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-all capitalize cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : cat.split('-')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Search size={12} className="text-slate-500" /> Search Curriculum
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-800 bg-slate-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-600 font-medium"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-600" />
          </div>
        </div>

        {/* Priority & Doubt filter combo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={12} className="text-slate-500" /> Focus Rules
          </label>
          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="flex-1 text-xs px-2 py-1.5 border border-slate-800 bg-slate-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200 font-medium cursor-pointer"
            >
              <option value="all">♻ Priority: All</option>
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟠 Medium Priority</option>
              <option value="low">🟡 Low Priority</option>
            </select>
            <button
              onClick={() => setDoubtFilter(!doubtFilter)}
              className={`px-3 py-1.5 border text-xs rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                doubtFilter
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Bookmark size={13} fill={doubtFilter ? 'currentColor' : 'none'} />
              <span>Doubts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div id="subject-accordion-list" className="space-y-4">
        {processedSubjects.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
            <HelpCircle size={36} className="text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-400">No Matched Syllabus</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-normal">
              Try adjusting your active filters, wiping search keywords or priority options.
            </p>
          </div>
        ) : (
          processedSubjects.map((sub) => {
            const isExpanded = expandedSubjectIds[sub.id] || searchQuery.length > 0;
            const { completionRate, completedChecks, totalTopicStageChecks } = getSubjectMetrics(sub);

            return (
              <div
                id={`subject-card-${sub.id}`}
                key={sub.id}
                className="group border border-slate-800/80 rounded-2xl overflow-hidden shadow-md bg-slate-950/40 hover:border-slate-700 transition-all"
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleSubject(sub.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-950 cursor-pointer select-none transition-colors border-b border-transparent group-hover:border-slate-800/65"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Expand Indicator */}
                    <div className="text-slate-500 group-hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>

                    {/* Subject Color Block & Title */}
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `var(--color-${sub.color}-500)` }} />
                    <h3 className="text-sm font-black text-white">{sub.name}</h3>

                    {/* Category Label */}
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold border px-2 py-0.5 rounded-full ${getCategoryBadgeColor(sub.category)}`}>
                      {sub.category}
                    </span>

                    {/* Filter count if active */}
                    {searchQuery.length > 0 && (
                      <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 font-extrabold px-2 py-0.5 rounded-full">
                        {sub.topics.length} of {sub.originalTopicsCount} matched
                      </span>
                    )}
                  </div>

                  {/* Right Header Stats */}
                  <div className="flex items-center gap-4 mt-2.5 sm:mt-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CheckCircle size={13} className="text-slate-500" />
                      <span className="font-bold">{completedChecks}/{totalTopicStageChecks} Checks Done</span>
                    </div>

                    {/* Linear progress metric */}
                    <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden shrink-0 hidden md:block border border-slate-850">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${completionRate}%`,
                          backgroundColor: `var(--color-${sub.color}-500)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-white pr-1">{completionRate}%</span>
                  </div>
                </div>

                {/* Body Topics Checklist */}
                {isExpanded && (
                  <div className="px-4 py-3 divide-y divide-slate-900 bg-slate-950/80">
                    
                    {/* Subject Level Actions */}
                    <div className="flex items-center justify-between py-2 text-[10px] text-slate-500 font-extrabold mb-1">
                      <span>{sub.topics.length} CORE CURRICULUM TOPICS</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBulkAction(sub.id, 'check-all-read');
                          }}
                          className="flex items-center gap-1 text-slate-450 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          <CheckSquare size={12} /> Mark Read
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBulkAction(sub.id, 'clear-all');
                          }}
                          className="flex items-center gap-1 text-slate-450 hover:text-rose-450 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} /> Clear Page
                        </button>
                      </div>
                    </div>

                    {/* Checklist Grid row */}
                    {sub.topics.map((topic) => {
                      const completeStagesCount = Object.values(topic.stages).filter(Boolean).length;
                      const isTopicFullyDone = completeStagesCount === 6;

                      return (
                        <div
                          id={`topic-row-${topic.id}`}
                          key={topic.id}
                          className={`py-3 flex flex-col gap-2 relative transition-all ${
                            isTopicFullyDone ? 'bg-indigo-950/5' : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              {/* Bookmark Doubt Flag */}
                              <button
                                onClick={() => onToggleTopicDoubt(sub.id, topic.id)}
                                className={`p-1 rounded-lg hover:bg-slate-900 transition-colors shrink-0 mt-0.5 cursor-pointer ${
                                  topic.isDoubted
                                    ? 'text-rose-500 hover:bg-rose-500/10'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                                title="Mark / Flag Doubt Topic"
                              >
                                <Bookmark size={14} fill={topic.isDoubted ? 'currentColor' : 'none'} />
                              </button>

                              {/* Priority Cycler Button */}
                              <button
                                onClick={() => {
                                  const list: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
                                  const currentIdx = list.indexOf(topic.priority);
                                  const nextPriority = list[(currentIdx + 1) % list.length];
                                  onUpdateTopicPriority(sub.id, topic.id, nextPriority);
                                }}
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 select-none mt-1 transition-all border cursor-pointer ${
                                  topic.priority === 'high'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                    : topic.priority === 'medium'
                                    ? 'bg-orange-500/10 text-orange-450 border-orange-500/20 hover:bg-orange-500/20'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                                }`}
                                title="Priority (Click to cycle)"
                              >
                                {topic.priority}
                              </button>

                              {/* Title labels */}
                              <span
                                className={`text-xs font-bold leading-normal truncate ${
                                  isTopicFullyDone
                                    ? 'line-through text-slate-600 font-medium'
                                    : 'text-slate-200'
                                }`}
                              >
                                {topic.name}
                              </span>
                            </div>

                            {/* 6 Grid layout Checkbox cells */}
                            <div className="flex items-center gap-1.5 bg-slate-950/50 p-1.5 rounded-xl w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-start select-none border border-slate-850">
                              {stageKeys.map((stage) => {
                                const isChecked = topic.stages[stage.name];
                                return (
                                  <label
                                    key={stage.name}
                                    title={stage.label}
                                    className={`group flex-1 sm:flex-none flex items-center justify-center p-0.5 flex-col aspect-square w-9 h-9 sm:w-8 sm:h-8 rounded-lg cursor-pointer border text-center font-extrabold transition-all duration-150 relative ${
                                      isChecked
                                        ? 'bg-blue-600 border-blue-500 text-white font-black shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        onUpdateTopicStage(sub.id, topic.id, stage.name, e.target.checked)
                                      }
                                      className="sr-only"
                                    />
                                    <span className="text-[10px] sm:text-[9px] leading-none uppercase select-none">{stage.short}</span>
                                    <div
                                      className={`absolute -bottom-0.5 right-0 w-1.5 h-1.5 rounded-full ${
                                        isChecked ? 'bg-white' : 'bg-transparent'
                                      }`}
                                    />
                                  </label>
                                );
                              })}

                              {/* Study notes checklist icon button */}
                              <button
                                onClick={() => {
                                  if (editingNotesTopicId === topic.id) {
                                    setEditingNotesTopicId(null);
                                  } else {
                                    setEditingNotesTopicId(topic.id);
                                    setNotesBuffer(topic.notesText || '');
                                  }
                                }}
                                className={`p-2 sm:p-1.5 hover:bg-slate-800 rounded-lg transition-all shrink-0 ml-1 flex items-center justify-center cursor-pointer ${
                                  topic.notesText && topic.notesText.trim() !== ''
                                    ? 'bg-amber-500/15 text-amber-450 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                                title="Study notes summaries"
                              >
                                <FileText size={14} />
                              </button>
                            </div>

                          </div>

                          {/* Interactive Notes Textarea card */}
                          {editingNotesTopicId === topic.id && (
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl mt-2 space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black text-amber-450 uppercase pb-1 border-b border-slate-900">
                                <span>Highlighted Formula Logs / Mnemonics</span>
                                <span className="text-slate-600 font-bold font-mono">Saves locally</span>
                              </div>
                              <textarea
                                value={notesBuffer}
                                onChange={(e) => setNotesBuffer(e.target.value)}
                                placeholder="Jot down high-yield diagnostics schema, guidelines or exceptions..."
                                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-y font-medium text-slate-100"
                              />
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  onClick={() => setEditingNotesTopicId(null)}
                                  className="text-[10px] px-2.5 py-1.5 text-slate-500 hover:bg-slate-900 rounded-lg font-bold"
                                >
                                  Close
                                </button>
                                <button
                                  onClick={() => handleNotesUpdateSave(sub.id, topic.id)}
                                  className="text-[10px] px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-black shadow-md shadow-amber-600/10 cursor-pointer"
                                >
                                  Save Memo
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Collapsed read notes indicator */}
                          {editingNotesTopicId !== topic.id && topic.notesText && (
                            <div className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 p-2 rounded-xl mt-1 italic flex items-center justify-between">
                              <span className="truncate pr-4 flex-1">Memo Highlight: {topic.notesText}</span>
                              <button
                                onClick={() => {
                                  setEditingNotesTopicId(topic.id);
                                  setNotesBuffer(topic.notesText);
                                }}
                                className="text-[10px] text-blue-450 font-bold hover:underline shrink-0"
                              >
                                Edit notes
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
