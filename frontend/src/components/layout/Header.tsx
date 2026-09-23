import React from 'react';
import { Shield } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Platform Branding */}
      <div className="flex items-center space-x-2.5">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[14px] font-bold tracking-tight text-slate-900 font-sans">
          Orbit
        </span>
      </div>
    </header>
  );
};
