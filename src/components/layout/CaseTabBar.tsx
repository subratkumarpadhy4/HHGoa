import React from 'react';
import { X, Layers } from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';
import { getCaseLifecycleStatus, getStatusDot } from '../../types/investigation';

interface CaseTabBarProps {
  openCaseIds: string[];
  activeCaseId: string;
  allCases: BenchmarkCase[];
  onSelectTab: (caseId: string) => void;
  onCloseTab: (caseId: string) => void;
}

export const CaseTabBar: React.FC<CaseTabBarProps> = ({
  openCaseIds,
  activeCaseId,
  allCases,
  onSelectTab,
  onCloseTab,
}) => {
  if (openCaseIds.length === 0) {
    return (
      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500 select-none min-h-[38px]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide font-mono">Workspace Standby</span>
          <span className="text-slate-400 text-[11.5px] font-normal">• Select a case from the left dropdown to open investigation tabs</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F5F9] border-b border-slate-200 px-3 pt-1.5 flex items-center gap-1.5 select-none shrink-0 min-h-[38px] z-20 overflow-x-auto no-scrollbar">
      {/* Browser-Styled Tabs Row */}
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
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg text-[12px] cursor-pointer transition-all border border-b-0 shrink-0 ${
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

            <span className="truncate max-w-[190px]">
              {caseItem.case_id} — {caseItem.primary_pattern}
            </span>

            {/* Close Tab Button - Always allowed so user can close all tabs */}
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
          </div>
        );
      })}
    </div>
  );
};
