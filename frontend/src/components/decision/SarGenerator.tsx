import React from 'react';
import { 
  FileText, 
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';
import { downloadSarPdf } from '../../utils/sarBuilder';

interface SarGeneratorProps {
  caseItem?: BenchmarkCase | null;
  sarStatus?: 'Pending' | 'Cleared';
  onStatusChange?: (status: 'Pending' | 'Cleared') => void;
  compact?: boolean;
}

export const SarGenerator: React.FC<SarGeneratorProps> = ({ 
  caseItem, 
  sarStatus = 'Pending',
}) => {
  if (!caseItem) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 select-none space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider font-mono">Regulatory Filing</span>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">Standby</span>
        </div>
        <p className="text-[11.5px] text-slate-400 leading-snug">
          Select a case to prepare SAR report exports.
        </p>
      </div>
    );
  }

  const isResolved = sarStatus === 'Cleared' || caseItem.status.startsWith('resolved') || caseItem.status === 'requires_approval';
  const isFraud = caseItem.initial_risk_score >= 0.75 || caseItem.graph_nodes.some(n => n.isFraudRing);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 select-none space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
            Regulatory Filing
          </span>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border ${
          isResolved 
            ? (isFraud ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isResolved ? (
            isFraud ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <Clock className="w-3 h-3 text-amber-600" />
          )}
          <span>
            {isResolved 
              ? (isFraud ? 'SAR Required' : 'Cleared') 
              : 'Under Review'}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => downloadSarPdf(caseItem, isResolved)}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
        title="Download SAR PDF report"
      >
        <Download className="w-3.5 h-3.5" />
        <span>
          {isResolved 
            ? (isFraud ? 'Download SAR Report (PDF)' : 'Download Clearance Memo (PDF)')
            : 'Download Report (PDF)'}
        </span>
      </button>
    </div>
  );
};
