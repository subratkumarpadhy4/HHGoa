import { useState } from 'react';
import { 
  Check, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface ApprovalActionBarProps {
  currentCase: BenchmarkCase;
  onApproveAction: (actionName: string) => void;
  onOverrideAction: (overrideName: string) => void;
  onCloseFalsePositive: () => void;
  isInvestigating?: boolean;
}

export const ApprovalActionBar: React.FC<ApprovalActionBarProps> = ({
  currentCase,
  onApproveAction,
  onOverrideAction,
  onCloseFalsePositive,
  isInvestigating,
}) => {
  const [decided, setDecided] = useState<string | null>(null);

  const handleApprove = () => {
    onApproveAction(currentCase.post_evidence_nba.action);
    setDecided('Action approved & committed to graph');
    setTimeout(() => setDecided(null), 3500);
  };

  const handleOverride = () => {
    onOverrideAction('Manual Analyst Override');
    setDecided('Routed for manual override');
    setTimeout(() => setDecided(null), 3500);
  };

  const handleFalsePositive = () => {
    onCloseFalsePositive();
    setDecided('Marked false positive — cleared');
    setTimeout(() => setDecided(null), 3500);
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shrink-0 select-none">
      {decided ? (
        <div className="flex items-center justify-center gap-2 py-2 text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-4 h-4" />
          <span>{decided}</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {/* Approve */}
          <button
            type="button"
            disabled={isInvestigating}
            onClick={handleApprove}
            className="col-span-1 flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>

          {/* Override */}
          <button
            type="button"
            disabled={isInvestigating}
            onClick={handleOverride}
            className="col-span-1 flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Override</span>
          </button>

          {/* False Positive */}
          <button
            type="button"
            disabled={isInvestigating}
            onClick={handleFalsePositive}
            className="col-span-1 flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>False Positive</span>
          </button>
        </div>
      )}
    </div>
  );
};
