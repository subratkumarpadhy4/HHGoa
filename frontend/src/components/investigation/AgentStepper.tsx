import { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronDown, 
  Activity,
  Terminal
} from 'lucide-react';
import type { ExecutionStep } from '../../types/investigation';

interface AgentStepperProps {
  steps: ExecutionStep[];
  isInvestigating: boolean;
  activeStepIndex?: number;
}

export const AgentStepper: React.FC<AgentStepperProps> = ({
  steps,
  isInvestigating,
  activeStepIndex = 5,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [expandedKey, setExpandedKey] = useState<number | null>(4); // default open dynamic evidence step

  // Auto-expand if investigation is actively running
  useEffect(() => {
    if (isInvestigating) {
      setIsCollapsed(false);
    }
  }, [isInvestigating]);

  return (
    <div className="bg-white border-t border-slate-200 select-none shrink-0 transition-all duration-200">
      {/* Collapsible Header Bar */}
      <div
        onClick={() => setIsCollapsed(prev => !prev)}
        className="px-4 py-2 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            Agentic Investigation Feed
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            {steps.length === 0 
              ? 'Idle' 
              : isInvestigating 
              ? `Step ${Math.min(activeStepIndex + 1, steps.length)} of ${steps.length}` 
              : `${steps.length}/${steps.length} Completed`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 font-medium">
            {isCollapsed ? 'Show Details' : 'Hide'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
        </div>
      </div>

      {/* Expandable Stepper body */}
      {!isCollapsed && (
        <div className="px-4 pt-2 pb-3 border-t border-slate-100 max-h-56 overflow-y-auto space-y-0">
        {steps.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            No active case selected. Stepper feed will activate once a case is loaded.
          </div>
        ) : (
          steps.map((s, i) => {
          const done = !isInvestigating || i < activeStepIndex;
          const active = isInvestigating && i === activeStepIndex;
          const isPending = isInvestigating && i > activeStepIndex;
          const expanded = expandedKey === s.id;

          return (
            <div key={s.id} className="flex gap-3">
              {/* Stepper Node & Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : active
                      ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {done ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  ) : (
                    <span className="text-[9px] font-bold">{s.id}</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[16px] ${
                      done ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Step Button & Detail */}
              <button
                type="button"
                onClick={() => setExpandedKey(expanded ? null : s.id)}
                className={`flex-1 text-left pb-3.5 focus:outline-none ${isPending ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[12.5px] font-semibold ${active ? 'text-indigo-700 font-bold' : 'text-slate-800'}`}>
                      {s.title}
                    </span>
                    {s.mcpCall && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-[9px]">
                        <Terminal className="w-2.5 h-2.5" />
                        <span>{s.mcpCall.tool}</span>
                        <span className="text-slate-400">({s.mcpCall.latencyMs}ms)</span>
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {expanded && (
                  <div className="mt-1.5 text-[11.5px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1.5">
                    <p className="font-normal">{s.details}</p>
                    {s.outputSnippet && (
                      <div className="p-2 bg-slate-900 text-indigo-300 rounded font-mono text-[10.5px] overflow-x-auto">
                        <span className="text-slate-500 mr-1.5">&gt;</span>
                        {s.outputSnippet}
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
          })
        )}
        </div>
      )}
    </div>
  );
};
