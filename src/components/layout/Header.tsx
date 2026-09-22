import React from 'react';
import { Shield } from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface HeaderProps {
  activeCase: BenchmarkCase;
  allCases: BenchmarkCase[];
  onSelectCase: (caseItem: BenchmarkCase) => void;
  onOpenLlmInspector?: () => void;
  onOpenExportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCase,
  allCases,
  onSelectCase,
}) => {
  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Platform Branding */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-[14px] font-bold tracking-tight text-slate-900 font-sans">
          Orbit
        </span>
      </div>

      {/* Right Action Tools: Case Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Benchmark Switcher */}
        <select
          value={activeCase.case_id}
          onChange={(e) => {
            const selected = allCases.find(c => c.case_id === e.target.value);
            if (selected) onSelectCase(selected);
          }}
          aria-label="Select Benchmark Case"
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
        >
          {allCases.map((c) => (
            <option key={c.case_id} value={c.case_id}>
              {c.case_id} — {c.primary_pattern} (${c.amount_usd.toFixed(0)})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
