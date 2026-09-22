import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Platform Branding */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-bold tracking-tight text-slate-900 font-sans">
            Orbit
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Autonomous Fraud Cockpit
          </span>
        </div>
      </div>

      {/* Right: Substrate Tag */}
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Graph Reasoning Engine</span>
        </span>
      </div>
    </header>
  );
};
