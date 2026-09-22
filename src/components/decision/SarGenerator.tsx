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
  onExportCaseJson?: () => void;
}

export const SarGenerator: React.FC<SarGeneratorProps> = ({ 
  sarReport, 
  caseId,
  onExportCaseJson
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (!sarReport) return;
    navigator.clipboard.writeText(sarReport.narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSar = () => {
    if (!sarReport) return;
    const blob = new Blob([sarReport.narrative], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId || 'CASE'}-SAR.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 select-none space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>Suspicious Activity Report</span>
        </div>
        {sarReport ? (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
            Required
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
            Pending / Cleared
          </span>
        )}
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
            <button
              type="button"
              onClick={handleExportSar}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SAR</span>
            </button>
          </div>
        </>
      ) : (
        <div className="border border-slate-200 rounded-lg p-3 text-[12px] text-slate-400 bg-slate-50 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          <span>No SAR required for this outcome.</span>
        </div>
      )}

      {onExportCaseJson && (
        <button
          type="button"
          onClick={onExportCaseJson}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Case JSON (hackathon format)</span>
        </button>
      )}
    </div>
  );
};
