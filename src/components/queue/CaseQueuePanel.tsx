import { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Play
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface CaseQueuePanelProps {
  cases: BenchmarkCase[];
  activeCaseId: string;
  onSelectCase: (c: BenchmarkCase) => void;
  onManualTrigger: (customTxnId: string, customScore: number) => void;
  isInvestigating?: boolean;
}

type TabType = 'under_investigation' | 'requires_approval' | 'resolved';

export const CaseQueuePanel: React.FC<CaseQueuePanelProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onManualTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('under_investigation');
  const [manualInput, setManualInput] = useState('');

  // Counts for tabs
  const counts = useMemo(() => ({
    under_investigation: cases.filter(c => c.status === 'under_investigation').length,
    requires_approval: cases.filter(c => c.status === 'requires_approval').length,
    resolved: cases.filter(c => c.status.startsWith('resolved')).length,
  }), [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (activeTab === 'under_investigation') return c.status === 'under_investigation';
      if (activeTab === 'requires_approval') return c.status === 'requires_approval';
      if (activeTab === 'resolved') return c.status.startsWith('resolved');
      return true;
    });
  }, [cases, activeTab]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const score = parseFloat(manualInput) || 0.85;
    onManualTrigger(manualInput, score);
    setManualInput('');
  };

  const getRiskTone = (score: number) => {
    if (score >= 0.75) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (score >= 0.45) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 select-none">
      {/* Brand & Tab Header matching Image 1 */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[13px] font-bold leading-tight tracking-tight text-slate-900">
              Sentra
            </div>
            <div className="text-[10.5px] text-slate-500 leading-tight">
              Case Queue
            </div>
          </div>
        </div>

        {/* 3 Live Filter Tabs */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('under_investigation')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              activeTab === 'under_investigation'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Under Investigation</span>
            <span className={`mono text-[11px] px-1.5 rounded font-bold ${
              activeTab === 'under_investigation' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {counts.under_investigation}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requires_approval')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              activeTab === 'requires_approval'
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Requires Approval</span>
            <span className={`mono text-[11px] px-1.5 rounded font-bold ${
              activeTab === 'requires_approval' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {counts.requires_approval}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              activeTab === 'resolved'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Resolved / Closed</span>
            <span className={`mono text-[11px] px-1.5 rounded font-bold ${
              activeTab === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {counts.resolved}
            </span>
          </button>
        </div>
      </div>

      {/* Case List Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredCases.map((c: BenchmarkCase) => {
          const isSelected = c.case_id === activeCaseId;
          const isResolved = c.status.startsWith('resolved');

          return (
            <button
              key={c.case_id}
              onClick={() => onSelectCase(c)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                isSelected
                  ? 'bg-indigo-50/70 border-l-2 border-l-indigo-600 shadow-xs'
                  : 'hover:bg-slate-50 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-bold text-slate-900 font-mono">
                  {c.case_id}
                </span>
                <span className={`mono text-[11px] px-1.5 py-0.2 rounded border font-bold ${getRiskTone(c.initial_risk_score)}`}>
                  {c.initial_risk_score.toFixed(2)}
                </span>
              </div>

              <div className="text-[11.5px] mono text-slate-500 mb-1.5">
                {c.transaction_id}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{c.timestamp.split(' ')[1] || c.timestamp}</span>
                </span>

                <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[10.5px] font-semibold ${
                  isResolved
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : c.status === 'requires_approval'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  <span>{isResolved ? 'Resolved' : c.status === 'requires_approval' ? 'Needs Approval' : 'Investigating'}</span>
                </span>
              </div>
            </button>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="px-4 py-10 text-center text-[12.5px] text-slate-400">
            No cases in this queue.
          </div>
        )}
      </div>

      {/* Manual Trigger Bar at Bottom matching Image 1 */}
      <div className="border-t border-slate-200 p-3 bg-slate-50/60">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Manual Trigger
        </div>
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Transaction ID or risk score"
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Autonomous Investigation</span>
          </button>
        </form>
      </div>
    </div>
  );
};
