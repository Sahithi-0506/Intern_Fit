import React from 'react';
import { INDIA_CITIES, OPPORTUNITY_CATEGORIES, WORK_MODES } from '@internfit/shared';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  search: string;
  onSearchChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  workMode: string;
  onWorkModeChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  search,
  onSearchChange,
  city,
  onCityChange,
  workMode,
  onWorkModeChange,
  category,
  onCategoryChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" />
          Filter Opportunities
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Role or Company
        </label>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="e.g. SDE, Microsoft, React..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
        />
      </div>

      {/* City / Location */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Location / City
        </label>
        <select
          value={city}
          onChange={e => onCityChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
        >
          <option value="All">All Locations in India</option>
          {INDIA_CITIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Work Mode
        </label>
        <select
          value={workMode}
          onChange={e => onWorkModeChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
        >
          <option value="All">All Modes</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Opportunity Type
        </label>
        <select
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
        >
          <option value="All">All Categories</option>
          <option value="paid_internship">Paid Internship</option>
          <option value="hiring_challenge">Hiring Challenge</option>
          <option value="coding_competition">Coding Competition</option>
          <option value="unpaid_internship">Unpaid Internship</option>
          <option value="learning_opportunity">Learning Opportunity</option>
        </select>
      </div>
    </div>
  );
};
