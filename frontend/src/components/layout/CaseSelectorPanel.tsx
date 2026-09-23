import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Check, 
  FolderOpen,
  Info
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';
import { getCaseLifecycleStatus, getStatusDot } from '../../types/investigation';

interface CaseSelectorPanelProps {
  activeCase: BenchmarkCase | null;
  allCases: BenchmarkCase[];
  openCaseIds: string[];
  onOpenCase: (caseId: string) => void;
}

export const CaseSelectorPanel: React.FC<CaseSelectorPanelProps> = ({
  activeCase,
  allCases,
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

  const activeStatus = activeCase ? getCaseLifecycleStatus(activeCase) : null;
  const activeDot = activeStatus ? getStatusDot(activeStatus) : null;

  // Cases filtered for dropdown search
  const dropdownCases = allCases.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(query) ||
      c.primary_pattern.toLowerCase().includes(query) ||
      c.amount_usd.toString().includes(query)
    );
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/70 select-none overflow-y-auto overflow-x-hidden text-slate-800">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <FolderOpen className="w-4 h-4 text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
            Case Selection
          </span>
        </div>

        {/* Primary Case Dropdown Box */}
        <div className="relative w-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
            title="Choose an investigation case"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              {/* Status Dot: green, yellow, red or neutral if no case */}
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10 ${
                  activeDot ? activeDot.colorClass : 'bg-slate-300'
                }`}
                title={activeDot ? `Status: ${activeDot.label}` : 'No case selected'}
              />
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-slate-900 truncate">
                  {activeCase ? activeCase.case_id : 'Select a case...'}
                </div>
                <div className="text-[10.5px] text-slate-500 truncate font-normal">
                  {activeCase 
                    ? `${activeCase.primary_pattern} ($${activeCase.amount_usd.toFixed(0)})` 
                    : 'Choose from 20 benchmark cases'}
                </div>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-indigo-600' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Popup - Perfectly constrained to w-full so it never breaks or overflows */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
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

              {/* Status Dot Legend at Top of Dropdown */}
              <div className="px-2.5 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Resolved</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Closed</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Pending</span>
                </span>
              </div>

              {/* Cases List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 py-1">
                {dropdownCases.map((c) => {
                  const status = getCaseLifecycleStatus(c);
                  const dot = getStatusDot(status);
                  const isSelected = activeCase?.case_id === c.case_id;

                  return (
                    <button
                      key={c.case_id}
                      type="button"
                      onClick={() => {
                        onOpenCase(c.case_id);
                        setDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                        isSelected ? 'bg-indigo-50/80 font-semibold text-indigo-950' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span 
                          className={`w-2 h-2 rounded-full shrink-0 ${dot.colorClass} ring-1 ring-black/10`} 
                          title={`Status: ${dot.label}`}
                        />
                        <span className="truncate text-[11.5px]">
                          <strong>{c.case_id}</strong>
                          <span className="text-slate-500 font-normal"> — {c.primary_pattern}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">
                          ${c.amount_usd.toFixed(0)}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}

                {dropdownCases.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No cases match search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Case Details Section (Only shown for the selected case) */}
      <div className="p-3.5 border-b border-slate-200 bg-white space-y-3">
        <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Active Case Details</span>
          {activeCase && (
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
              Selected
            </span>
          )}
        </div>

        {activeCase ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Case ID:</span>
              <span className="font-mono font-bold text-slate-900">{activeCase.case_id}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Typology:</span>
              <span className="font-semibold text-indigo-700 truncate max-w-[140px] text-right">
                {activeCase.primary_pattern}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Amount:</span>
              <span className="font-mono font-bold text-slate-900">${activeCase.amount_usd.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Anomaly:</span>
              <span className="font-mono font-bold text-rose-600">
                {Math.round(activeCase.initial_risk_score * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account:</span>
              <span className="font-mono text-slate-800">{activeCase.account_id}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Card:</span>
              <span className="font-mono text-slate-800">{activeCase.card_id}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono text-slate-700 text-[11px]">{activeCase.transaction_id}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[13px] text-slate-400">Status:</span>
              <span className={`px-2.5 py-1 rounded text-[12px] font-semibold ${
                activeStatus === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeStatus === 'Closed'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {activeDot?.label}
              </span>
            </div>
          </div>
        ) : (
          /* Clean Professional Standby State when no case is selected */
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Case ID:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Typology:</span>
              <span className="text-slate-400 font-normal">Standby</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Amount:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Anomaly:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Account:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Card:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[13px] text-slate-400">Status:</span>
              <span className="px-2.5 py-1 rounded text-[12px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                Standby
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Operational Guidance */}
      <div className="flex-1 p-3.5 flex flex-col justify-end text-slate-400">
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-[11px] leading-relaxed text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            Select a benchmark scenario above to load investigation topology, dynamic evidence, and automated SAR recommendations.
          </span>
        </div>
      </div>
    </div>
  );
};
