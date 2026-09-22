import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';
import { getCaseLifecycleStatus, getStatusDot } from '../../types/investigation';

interface CaseTabBarProps {
  openCaseIds: string[];
  activeCaseId: string;
  allCases: BenchmarkCase[];
  onSelectTab: (caseId: string) => void;
  onCloseTab: (caseId: string) => void;
  onOpenCase: (caseId: string) => void;
}

export const CaseTabBar: React.FC<CaseTabBarProps> = ({
  openCaseIds,
  activeCaseId,
  allCases,
  onSelectTab,
  onCloseTab,
  onOpenCase,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const activeCase = allCases.find((c) => c.case_id === activeCaseId) || allCases[0];
  const activeStatus = getCaseLifecycleStatus(activeCase);
  const activeDot = getStatusDot(activeStatus);

  // Filtered cases for dropdown search
  const filteredCases = allCases.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(query) ||
      c.primary_pattern.toLowerCase().includes(query) ||
      c.amount_usd.toString().includes(query)
    );
  });

  return (
    <div className="bg-[#F1F5F9] border-b border-slate-200 px-3 pt-1.5 flex items-center justify-between gap-3 select-none shrink-0 min-h-[40px] z-20">
      {/* Left: Browser-Styled Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
        {openCaseIds.map((caseId) => {
          const caseItem = allCases.find((c) => c.case_id === caseId);
          if (!caseItem) return null;

          const isActive = caseId === activeCaseId;
          const status = getCaseLifecycleStatus(caseItem);
          const dot = getStatusDot(status);

          return (
            <div
              key={caseId}
              onClick={() => onSelectTab(caseId)}
              title={`${caseItem.case_id} — ${caseItem.primary_pattern} (${dot.label})`}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[12px] cursor-pointer transition-all border border-b-0 shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 font-semibold shadow-xs border-slate-200 border-t-2 border-t-indigo-600 -mb-[1px] z-10'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900 border-transparent'
              }`}
            >
              {/* Colored Status Dot: Green = Resolved, Red = Closed, Yellow = Pending */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${dot.colorClass} shadow-xs ring-1 ring-black/10`}
                title={`Status: ${dot.label}`}
              />

              <span className="truncate max-w-[170px]">
                {caseItem.case_id} — {caseItem.primary_pattern}
              </span>

              {/* Close Tab Button (allowed when > 1 tab open) */}
              {openCaseIds.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(caseId);
                  }}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors ml-0.5"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Case Selector Dropdown with Colored Status Dots */}
      <div className="relative shrink-0 mb-1" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          title="Select or open a benchmark case"
        >
          {/* Status Dot for Current Selection */}
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${activeDot.colorClass} ring-1 ring-black/10`}
            title={`Status: ${activeDot.label}`}
          />

          <span className="text-[12px] font-semibold text-slate-800">
            {activeCase.case_id} — {activeCase.primary_pattern} (${activeCase.amount_usd.toFixed(0)})
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Custom Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search 20 cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Cases List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
              {filteredCases.map((c) => {
                const status = getCaseLifecycleStatus(c);
                const dot = getStatusDot(status);
                const isSelected = c.case_id === activeCaseId;
                const isOpenInTabs = openCaseIds.includes(c.case_id);

                return (
                  <button
                    key={c.case_id}
                    type="button"
                    onClick={() => {
                      onOpenCase(c.case_id);
                      setDropdownOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/60 font-semibold text-indigo-950' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {/* Colored Status Dot: Green = Resolved, Red = Closed, Yellow = Pending */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${dot.colorClass} ring-1 ring-black/10`}
                        title={`Status: ${dot.label}`}
                      />

                      <span className="truncate text-[12px]">
                        <strong className="font-semibold text-slate-900">{c.case_id}</strong>
                        <span className="text-slate-500 font-normal"> — {c.primary_pattern}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500">
                        ${c.amount_usd.toFixed(0)}
                      </span>

                      {isOpenInTabs && !isSelected && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono font-medium">
                          open
                        </span>
                      )}

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredCases.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching cases found.
                </div>
              )}
            </div>

            {/* Dropdown Footer Legend */}
            <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10.5px] text-slate-500 flex items-center justify-around font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Resolved</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Closed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Pending</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
