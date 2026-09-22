import React from 'react';
import { 
  Server, 
  Cpu, 
  FileCode2, 
  Download
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface HeaderProps {
  activeCase: BenchmarkCase;
  allCases: BenchmarkCase[];
  onSelectCase: (caseItem: BenchmarkCase) => void;
  onOpenLlmInspector: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCase,
  allCases,
  onSelectCase,
  onOpenLlmInspector,
  onOpenExportModal,
}) => {
  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Platform Title and Badges matching Image 1 */}
      <div className="flex items-center space-x-3">
        <span className="text-[13.5px] font-extrabold tracking-tight text-slate-900 font-sans">
          Agentic Fraud Investigation & NBA Platform
        </span>

        {/* TigerGraph Savanna Badge */}
        <div className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Server className="w-3 h-3 text-slate-500" />
          <span>TigerGraph Savanna</span>
        </div>

        {/* LangGraph Orchestrator Badge */}
        <div className="hidden md:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
          <Cpu className="w-3 h-3 text-indigo-500" />
          <span>LangGraph Orchestrator</span>
        </div>
      </div>

      {/* Right Action Tools: Live status, Switcher, Prompts Inspector, Exporter */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold mr-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px]">Live</span>
        </div>

        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
          Demo Environment
        </span>

        {/* Quick Benchmark Switcher */}
        <select
          value={activeCase.case_id}
          onChange={(e) => {
            const selected = allCases.find(c => c.case_id === e.target.value);
            if (selected) onSelectCase(selected);
          }}
          aria-label="Select Benchmark Case"
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          {allCases.map((c) => (
            <option key={c.case_id} value={c.case_id}>
              {c.case_id} — {c.primary_pattern} (${c.amount_usd.toFixed(0)})
            </option>
          ))}
        </select>

        {/* Person B LLM Reasoning & Prompt Inspector */}
        <button
          onClick={onOpenLlmInspector}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-colors"
          title="Inspect Person B LLM Prompts, Ordinal Schemas and Evidence Pack"
        >
          <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden lg:inline text-[11.5px]">LLM Prompts & Schema</span>
        </button>

        {/* Hackathon 20-Case JSON Exporter */}
        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs transition-colors"
          title="Export official 20 Benchmark Cases Answer Format"
        >
          <Download className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden lg:inline text-[11.5px]">Export Submission</span>
        </button>
      </div>
    </header>
  );
};
