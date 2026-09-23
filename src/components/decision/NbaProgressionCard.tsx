import React from 'react';
import { 
  ArrowDown, 
  Lock, 
  Check, 
  User, 
  Activity 
} from 'lucide-react';
import type { NbaRecommendation, DynamicEvidenceRequest, ApprovalTier } from '../../types/investigation';

interface NbaProgressionCardProps {
  preNba?: NbaRecommendation;
  evidenceInjected?: DynamicEvidenceRequest;
  postNba?: NbaRecommendation;
  isInvestigating?: boolean;
}

export const NbaProgressionCard: React.FC<NbaProgressionCardProps> = ({
  preNba,
  evidenceInjected,
  postNba,
}) => {
  const getTierBadge = (tier: ApprovalTier) => {
    if (tier === 'L2') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold text-rose-700 bg-rose-50 border-rose-200">
          <Lock className="w-2.5 h-2.5" />
          <span>L2 · Compliance</span>
        </span>
      );
    }
    if (tier === 'L1') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
          <User className="w-2.5 h-2.5" />
          <span>L1 · Analyst</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
        <Check className="w-2.5 h-2.5" />
        <span>Auto</span>
      </span>
    );
  };

  if (!preNba || !postNba || !evidenceInjected) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-slate-400" />
            <span>Next-Best-Action Progression</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-medium">
            Standby
          </span>
        </div>

        <div className="space-y-2 opacity-65">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Stage 1 · Before Evidence
            </div>
            <div className="text-[12px] font-medium text-slate-600">
              Initial Triage & Hold Assessment
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Stage 2 · Dynamic Evidence Trigger
            </div>
            <div className="text-[12px] font-medium text-slate-600">
              Step-Up Challenge & Verification
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Stage 3 · Policy Gate & Containment
            </div>
            <div className="text-[12px] font-medium text-slate-600">
              Containment, Freeze, or Cleared Resolution
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFailedEvidence = evidenceInjected.status === 'FAILED';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 select-none">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Activity className="w-3 h-3 text-slate-500" />
        <span>Next-Best-Action Progression</span>
      </div>

      <div className="space-y-2">
        {/* Stage 1: Before Evidence */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Before Evidence
          </div>
          <div className="text-[13.5px] font-bold text-slate-900 mb-2 leading-snug">
            {preNba.action}
          </div>
          <div className="flex items-center justify-between">
            {getTierBadge(preNba.approval_tier)}
            <span className="text-[10.5px] text-slate-500 font-medium">
              {preNba.approval_route}
            </span>
          </div>
        </div>

        {/* Dynamic Evidence Injected Arrow & Card */}
        <div className="flex flex-col items-center py-0.5">
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 my-0.5" />
          <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11.5px] text-slate-600 font-medium truncate mr-2">
              {evidenceInjected.label}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10.5px] font-bold shrink-0 ${
              isFailedEvidence 
                ? 'text-rose-700 bg-rose-50 border-rose-200' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {evidenceInjected.response_payload.result || evidenceInjected.status}
            </span>
          </div>
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 my-0.5" />
        </div>

        {/* Stage 2: After Evidence */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 shadow-xs">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700 mb-1.5">
            After Evidence
          </div>
          <div className="text-[13.5px] font-bold text-slate-900 mb-2 leading-snug">
            {postNba.action}
          </div>
          <div className="flex items-center justify-between">
            {getTierBadge(postNba.approval_tier)}
            <span className="text-[10.5px] text-slate-600 font-medium">
              {postNba.approval_route}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
