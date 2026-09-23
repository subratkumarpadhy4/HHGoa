import { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download 
} from 'lucide-react';
import type { SarReport } from '../../types/investigation';

interface SarGeneratorProps {
  sarReport?: SarReport;
  caseId?: string;
  sarStatus?: 'Pending' | 'Cleared';
  onStatusChange?: (status: 'Pending' | 'Cleared') => void;
  onExportCaseJson?: () => void;
}

export const SarGenerator: React.FC<SarGeneratorProps> = ({ 
  sarReport, 
  caseId,
  sarStatus = 'Pending',
  onStatusChange,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (!sarReport) return;
    navigator.clipboard.writeText(sarReport.narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = sarReport?.narrative || `SUSPICIOUS ACTIVITY REPORT (SAR) / CLEARANCE MEMO
Case ID: ${caseId || 'CASE-01'}
Status: Cleared
Date: ${new Date().toISOString().slice(0, 10)}
Findings: Review completed. Case verified and cleared.
Compliance & AML Intelligence Division`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId || 'CASE'}-SAR-Cleared.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!caseId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 select-none space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>Suspicious Activity Report</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200">
            Template Standby
          </span>
        </div>

        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 space-y-2 opacity-65">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            FinCEN Statutory Template
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
            Autonomous narrative generation armed. Traversal signals, step-up challenge telemetry, and regulatory typology citations will compile automatically upon case selection.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed border border-slate-200"
          >
            <Copy className="w-3.5 h-3.5 text-slate-300" />
            <span>Copy SAR</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 select-none space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>Suspicious Activity Report</span>
        </div>
        
        {/* Only two status states: Pending and Cleared */}
        <button
          type="button"
          onClick={() => onStatusChange?.(sarStatus === 'Cleared' ? 'Pending' : 'Cleared')}
          title="Toggle SAR status between Pending and Cleared"
          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            sarStatus === 'Cleared'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${sarStatus === 'Cleared' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{sarStatus}</span>
        </button>
      </div>

      {sarReport ? (
        <>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <textarea
              readOnly
              value={sarReport.narrative}
              rows={7}
              className="w-full resize-none p-3 text-[11px] mono bg-slate-50 text-slate-700 leading-relaxed focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SAR'}</span>
            </button>

            {/* Download button appears ONLY when status is "Cleared" */}
            {sarStatus === 'Cleared' && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="border border-slate-200 rounded-lg p-3 text-[12px] text-slate-500 bg-slate-50 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {sarStatus === 'Cleared' 
                ? 'Case cleared. No regulatory violation detected.' 
                : 'Investigation pending review. Awaiting clearance.'}
            </span>
          </div>

          {/* Download button appears ONLY when status is "Cleared" */}
          {sarStatus === 'Cleared' && (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
