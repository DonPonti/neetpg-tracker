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

  // Render Category styling
  const getCategoryBadgeColor = (cat: SubjectCategory) => {
    switch (cat) {
      case 'pre-clinical':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'para-clinical':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'clinical':
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const stageKeys: { name: PrepStage; short: string; label: string; color: string }[] = [
    { name: 'read', short: 'R', label: 'First Read', color: 'group-hover:text-emerald-500 checked:bg-emerald-500 hover:border-emerald-500 focus:ring-emerald-500' },
    { name: 'rev1', short: 'v1', label: 'Revision 1', color: 'group-hover:text-indigo-500 checked:bg-indigo-500 hover:border-indigo-500 focus:ring-indigo-500' },
    { name: 'rev2', short: 'v2', label: 'Revision 2', color: 'group-hover:text-cyan-500 checked:bg-cyan-500 hover:border-cyan-500 focus:ring-cyan-500' },
    { name: 'mcq', short: 'Q', label: 'MCQs Checked', color: 'group-hover:text-blue-500 checked:bg-blue-500 hover:border-blue-500 focus:ring-blue-500' },
    { name: 'pyq', short: 'Y', label: 'PYQs Mastered', color: 'group-hover:text-rose-500 checked:bg-rose-500 hover:border-rose-500 focus:ring-rose-500' },
    { name: 'notes', short: 'N', label: 'Short Notes', color: 'group-hover:text-amber-500 checked:bg-amber-500 hover:border-amber-500 focus:ring-amber-500' },
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
    <div id="syllabus-tracker-core" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-display">
            <BookMarked size={20} className="text-blue-600" /> All 19 Subjects Progress Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toggle preparation stages and write customized reminders. Changes persist inside your web browser.
          </p>
        </div>

        {/* Global actions info */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-bold px-2.5 py-1.5 bg-blue-50 border border-blue-100/50 text-blue-800 rounded-lg shadow-xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" /> Total 19 Subjects catalogued
        </div>
      </div>

      {/* Filter Options */}
      <div id="filters-container" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-100">
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-tight flex items-center gap-1">
            <Filter size={12} /> Filter Category
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'pre-clinical', 'para-clinical', 'clinical'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat === 'all' ? 'All' : cat.split('-')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-tight flex items-center gap-1">
            <Search size={12} /> Search Topics
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search subjects or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Priority & Doubt filter combo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-tight flex items-center gap-1">
            <AlertTriangle size={12} /> Smart Filters
          </label>
          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="flex-1 text-xs px-2 py-1.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">♻ Priority: All</option>
              <option value="high">🔴 Priority: High</option>
              <option value="medium">🟠 Priority: Medium</option>
              <option value="low">🟡 Priority: Low</option>
            </select>
            <button
              onClick={() => setDoubtFilter(!doubtFilter)}
              className={`px-3 py-1.5 border text-xs rounded-xl font-medium flex items-center gap-1 transition-colors ${
                doubtFilter
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <HelpCircle size={36} className="text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-600">No Matched Syllabus Matches</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your active filters, wiping search keywords or priority selections.
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
                className="group border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:border-slate-200/80 transition-all bg-white"
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleSubject(sub.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors border-b border-transparent group-hover:border-slate-100"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Expand Badge */}
                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {/* Subject Color Block & Title */}
                    <div className={`w-3 h-3 rounded-md bg-${sub.color}-500`} style={{ backgroundColor: `var(--color-${sub.color}-500)` }} />
                    <h3 className="text-sm font-extrabold text-slate-800">{sub.name}</h3>

                    {/* Category Label */}
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold border px-2 py-0.5 rounded-full ${getCategoryBadgeColor(sub.category)}`}>
                      {sub.category}
                    </span>

                    {/* Filtered alert count if searching */}
                    {searchQuery.length > 0 && (
                      <span className="text-[10px] bg-sky-50 border border-sky-100 text-sky-700 font-medium px-2 py-0.5 rounded-full">
                        {sub.topics.length} of {sub.originalTopicsCount} topics matched
                      </span>
                    )}
                  </div>

                  {/* Right Header Stats */}
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle size={14} className="text-slate-400" />
                      <span className="font-medium">{completedChecks}/{totalTopicStageChecks} Done</span>
                    </div>

                    {/* Micro Progress Bar */}
                    <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0 hidden md:block">
                      <div
                        className={`bg-${sub.color}-500 h-full rounded-full transition-all duration-300`}
                        style={{
                          width: `${completionRate}%`,
                          backgroundColor: `var(--color-${sub.color}-500)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 pr-1">{completionRate}%</span>
                  </div>
                </div>

                {/* Body Topics Checklist */}
                {isExpanded && (
                  <div className="px-4 py-3 divide-y divide-slate-100 bg-white">
                    {/* Subject Level Bulk Actions */}
                    <div className="flex items-center justify-between py-2 text-[10px] text-slate-400 font-semibold mb-1">
                      <span>{sub.topics.length} TOPICS RECORDED</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBulkAction(sub.id, 'check-all-read');
                          }}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <CheckSquare size={12} /> Mark All "Read"
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBulkAction(sub.id, 'clear-all');
                          }}
                          className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={12} /> Clear Progress
                        </button>
                      </div>
                    </div>

                    {/* Grid List */}
                    {sub.topics.map((topic) => {
                      const completeStagesCount = Object.values(topic.stages).filter(Boolean).length;
                      const isTopicFullyDone = completeStagesCount === 6;

                      return (
                        <div
                          id={`topic-row-${topic.id}`}
                          key={topic.id}
                          className={`py-3 flex flex-col gap-2 relative transition-all ${
                            isTopicFullyDone ? 'bg-slate-50/20' : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Topic naming and options */}
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              {/* Doubt Toggle */}
                              <button
                                onClick={() => onToggleTopicDoubt(sub.id, topic.id)}
                                className={`p-1 rounded hover:bg-slate-50 transition-colors shrink-0 mt-0.5 ${
                                  topic.isDoubted
                                    ? 'text-rose-500 hover:bg-rose-50'
                                    : 'text-slate-300 hover:text-slate-400'
                                }`}
                                title={topic.isDoubted ? 'Flagged as Doubt / Hard Topic' : 'Bookmark Doubt / Hard Topic'}
                              >
                                <Bookmark size={14} fill={topic.isDoubted ? 'currentColor' : 'none'} />
                              </button>

                              {/* Priority Cycle Indicator */}
                              <button
                                onClick={() => {
                                  const list: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
                                  const currentIdx = list.indexOf(topic.priority);
                                  const nextPriority = list[(currentIdx + 1) % list.length];
                                  onUpdateTopicPriority(sub.id, topic.id, nextPriority);
                                }}
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 select-none mt-1 transition-all ${
                                  topic.priority === 'high'
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/50'
                                    : topic.priority === 'medium'
                                    ? 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100/50'
                                    : 'bg-slate-50 text-slate-500 border border-slate-200/60 hover:bg-slate-100'
                                }`}
                                title="Click to cycle high/medium/low priority"
                              >
                                {topic.priority}
                              </button>

                              {/* Title text */}
                              <span
                                className={`text-xs font-bold leading-normal truncate-all ${
                                  isTopicFullyDone
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-700'
                                }`}
                              >
                                {topic.name}
                              </span>
                            </div>

                            {/* 6 Stage Toggle Boxes */}
                            <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-lg self-start sm:self-auto select-none border border-slate-100">
                              {stageKeys.map((stage) => {
                                const isChecked = topic.stages[stage.name];
                                return (
                                  <label
                                    key={stage.name}
                                    title={stage.label}
                                    className={`group flex items-center justify-center p-0.5 flex-col aspect-square w-8 rounded-md cursor-pointer border text-center font-extrabold transition-all duration-150 relative ${
                                      isChecked
                                        ? 'bg-blue-50 border-blue-250 text-blue-700 font-black'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100/60'
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
                                    <span className="text-[10px] leading-none uppercase select-none">{stage.short}</span>
                                    {/* Inline bullet indicator for checklist completeness */}
                                    <div
                                      className={`absolute -bottom-0.5 right-0 w-1.5 h-1.5 rounded-full ${
                                        isChecked ? 'bg-blue-500' : 'bg-transparent'
                                      }`}
                                    />
                                  </label>
                                );
                              })}

                              {/* Notes Button */}
                              <button
                                onClick={() => {
                                  if (editingNotesTopicId === topic.id) {
                                    setEditingNotesTopicId(null);
                                  } else {
                                    setEditingNotesTopicId(topic.id);
                                    setNotesBuffer(topic.notesText || '');
                                  }
                                }}
                                className={`p-1.5 hover:bg-slate-100 rounded-md transition-all shrink-0 ml-1 flex items-center justify-center ${
                                  topic.notesText && topic.notesText.trim() !== ''
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                    : 'text-slate-300 hover:text-slate-500'
                                }`}
                                title="Edit Topic Study Notes"
                              >
                                <FileText size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Notes Block */}
                          {editingNotesTopicId === topic.id && (
                            <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100/60 mt-2 space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold text-amber-800">
                                <span>TOPIC STUDY REMINDERS / HIGHLIGHTS</span>
                                <span className="text-slate-400 font-normal">Saves dynamically</span>
                              </div>
                              <textarea
                                value={notesBuffer}
                                onChange={(e) => setNotesBuffer(e.target.value)}
                                placeholder="Write key formulas, mnemonics, or test gaps here..."
                                className="w-full text-xs p-2 border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 h-16 resize-y font-medium text-slate-700"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingNotesTopicId(null)}
                                  className="text-[10px] px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded font-bold"
                                >
                                  Close
                                </button>
                                <button
                                  onClick={() => handleNotesUpdateSave(sub.id, topic.id)}
                                  className="text-[10px] px-3 py-1 bg-amber-500 text-white hover:bg-amber-600 rounded font-bold shadow-sm"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quick read display of existing notes */}
                          {editingNotesTopicId !== topic.id && topic.notesText && (
                            <div className="text-[11px] bg-slate-50 text-slate-500 border border-slate-100 p-2 rounded-lg mt-1 italic flex items-center justify-between">
                              <span className="truncate flex-1 pr-4">Memo: {topic.notesText}</span>
                              <button
                                onClick={() => {
                                  setEditingNotesTopicId(topic.id);
                                  setNotesBuffer(topic.notesText);
                                }}
                                className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                              >
                                Edit
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
