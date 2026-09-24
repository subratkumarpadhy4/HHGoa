import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Play, 
  Activity, 
  Check,
  X,
  Lock,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import type { BenchmarkCase, CaseAction } from '../../types/investigation';
import { downloadSarPdf } from '../../utils/sarBuilder';
import { DEMO_ANALYST_NAME, isCaseFraud } from '../../utils/caseActions';

interface NbaProgressionCardProps {
  currentCase?: BenchmarkCase | null;
  isInvestigating?: boolean;
  onRunInvestigation?: () => void;
  onApproveAction?: (caseId: string, actionId: string) => void;
  onDenyAction?: (caseId: string, actionId: string) => void;
  onToggleAutoAction?: (caseId: string, actionId: string) => void;
}

export const NbaProgressionCard: React.FC<NbaProgressionCardProps> = ({
  currentCase,
  isInvestigating = false,
  onRunInvestigation,
  onApproveAction,
  onDenyAction,
  onToggleAutoAction,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  if (!currentCase) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 select-none">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Incident Review</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] text-slate-400 bg-slate-100">
            No Case Selected
          </span>
        </div>
        <p className="text-[12px] text-slate-400 leading-relaxed">
          Select a case from the left panel to view transaction analysis and recommended next steps.
        </p>
      </div>
    );
  }

  const isFraud = isCaseFraud(currentCase);
  const actions: CaseAction[] = currentCase.actions || [];
  
  // Status evaluation
  const hasDeniedAction = actions.some(a => a.state === 'denied');
  const hasPendingApproval = actions.some(
    a => (a.approval_tier === 'L1' || a.approval_tier === 'L2') && 
         (a.state === 'pending_approval' || a.state === 'recommended')
  );
  
  const isPreInvestigation = currentCase.status === 'under_investigation' && !currentCase.activity_feed?.some(l => l.includes('investigation complete'));
  const isResolved = (currentCase.status === 'resolved_fraud' || currentCase.status === 'resolved_cleared') && !hasDeniedAction && !hasPendingApproval;

  const totalActions = actions.length;
  const executedCount = actions.filter(a => a.state === 'executed').length;

  // Operational narrative describing incident
  const getSummary = () => {
    if (isPreInvestigation) {
      return `Transaction of $${currentCase.amount_usd.toFixed(2)} on card ${currentCase.card_id} was flagged for review. Review the details and complete the steps below.`;
    }
    if (isFraud) {
      return `A payment of $${currentCase.amount_usd.toFixed(2)} was attempted on card ${currentCase.card_id}. The transaction came from a device tied to multiple accounts previously flagged for fraud. A two-factor authentication challenge timed out with no response.`;
    }
    return `A payment of $${currentCase.amount_usd.toFixed(2)} was held following a velocity alert. A two-factor authentication code was sent to the cardholder, who successfully confirmed the purchase within 14 seconds from their personal device.`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 select-none text-slate-800 transition-all duration-200">
      {/* Top Header: Title & Dynamic Verdict + Collapse/Expand Chevron */}
      <div className={`flex items-center justify-between gap-1.5 min-w-0 transition-all duration-200 ${isCollapsed ? 'pb-0 border-b-0' : 'pb-2 border-b border-slate-100'}`}>
        <div className="flex items-center gap-2">
          {isInvestigating ? (
            <Activity className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
          ) : hasDeniedAction ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : isResolved ? (
            isFraud ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            )
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="text-[13px] font-semibold text-slate-900">
            Incident Review
          </span>
        </div>

        <div className="flex items-center gap-1.5 justify-end">
          <span 
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 border ${
              isInvestigating
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : hasDeniedAction
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isResolved
                ? isFraud
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : hasPendingApproval
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
            title={
              hasPendingApproval
                ? 'Human Sign-off (L1/L2)'
                : hasDeniedAction
                ? 'Action Denied · Blocked'
                : isResolved
                ? isFraud
                  ? 'Confirmed Fraud'
                  : 'Verified Legitimate'
                : isInvestigating
                ? 'Investigation in Progress'
                : 'Pending Hold (30m)'
            }
          >
            {isInvestigating
              ? 'Investigating'
              : hasDeniedAction
              ? 'Action Denied'
              : isResolved
              ? isFraud
                ? 'Confirmed Fraud'
                : 'Verified Legitimate'
              : hasPendingApproval
              ? 'Pending'
              : 'Hold (30m)'}
          </span>

          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={isCollapsed ? 'Expand Incident Review' : 'Collapse Incident Review'}
            aria-label={isCollapsed ? 'Expand Incident Review' : 'Collapse Incident Review'}
            aria-expanded={!isCollapsed}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                isCollapsed ? '-rotate-90' : 'rotate-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Collapsible Content Area */}
      <div
        className={`grid transition-[grid-template-rows] duration-250 ease-in-out ${
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3 space-y-4">
            {/* Section 1: What Happened */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                What Happened
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                {getSummary()}
              </p>

        {/* Identity Verification Sub-row */}
        <div className="mt-2 flex items-center justify-between px-1 text-[11.5px]">
          <span className="text-slate-500 font-medium">Customer Verification:</span>
          <span className={`font-semibold flex items-center gap-1 ${
            isInvestigating
              ? 'text-indigo-600'
              : isPreInvestigation
              ? 'text-amber-600'
              : isFraud
              ? 'text-rose-600'
              : 'text-emerald-600'
          }`}>
            {isInvestigating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Checking SMS response...</span>
              </>
            ) : isPreInvestigation ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Awaiting challenge verification</span>
              </>
            ) : isFraud ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Failed (No response)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed by cardholder</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Denial Warning Banner if any action was denied */}
      {hasDeniedAction && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11.5px] flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-rose-950 flex items-center gap-1.5">
              <span>Containment Incomplete</span>
              <span className="text-[9.5px] font-mono uppercase bg-rose-200/80 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                Action Denied
              </span>
            </div>
            <p className="text-rose-800 mt-1 leading-snug">
              {currentCase.denial_warning || 'One or more required containment actions were denied. The case cannot advance to a resolved status until mandatory containment requirements are met.'}
            </p>
          </div>
        </div>
      )}

      {/* Section 2: Action Plan & Operator Checklist */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>{isPreInvestigation ? 'Investigation Steps' : isFraud ? 'Containment Checklist' : 'Clearance Steps'}</span>
          <div className="flex items-center gap-2">
            {!isPreInvestigation && (
              <span className="text-[11px] text-slate-500 font-normal">
                {executedCount} of {totalActions} executed
              </span>
            )}
          </div>
        </div>

        {/* Human Gate Identity Stamp */}
        {!isPreInvestigation && (
          <div className="mb-2 flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="text-slate-500 font-normal">Logged Analyst:</span>
              <span className="font-bold text-slate-900">{DEMO_ANALYST_NAME}</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded">
              L1/L2 Gate Active
            </span>
          </div>
        )}

        {isPreInvestigation ? (
          /* PRE-INVESTIGATION STEPS */
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 bg-amber-100 text-amber-800">
                1
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-slate-900">
                  Temporary 30-Minute Hold Active
                </div>
                <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                  Transaction held by risk rule pending verification check.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-slate-900">
                    Run Investigation
                  </div>
                  <div className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                    Check transaction graph, prior records, and customer verification.
                  </div>
                </div>
              </div>

              {onRunInvestigation && (
                <button
                  type="button"
                  onClick={() => onRunInvestigation()}
                  disabled={isInvestigating}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isInvestigating ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Investigating Case...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run Investigation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* CONTAINMENT / CLEARANCE CHECKLIST WITH EXPLICIT HUMAN APPROVAL GATING */
          <div className="space-y-2">
            {actions.map((action, idx) => {
              const isAuto = action.approval_tier === 'auto';
              const isL1L2 = action.approval_tier === 'L1' || action.approval_tier === 'L2';
              const isExecuted = action.state === 'executed';
              const isApproved = action.state === 'approved';
              const isDenied = action.state === 'denied';
              const isPending = action.state === 'pending_approval' || action.state === 'recommended';

              // 1. AUTO-TIER ITEMS: Keeps standard checkbox behavior
              if (isAuto) {
                return (
                  <div
                    key={action.id}
                    onClick={() => onToggleAutoAction?.(currentCase.case_id, action.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isExecuted 
                        ? 'bg-slate-50 border-slate-300 opacity-80' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 transition-colors ${
                      isExecuted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isExecuted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className={`text-[12px] font-semibold ${isExecuted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {action.title}
                        </div>
                        <span className="text-[9.5px] font-mono uppercase bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                          Auto
                        </span>
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                        {action.description}
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. L1/L2 ITEMS: PENDING APPROVAL (Locked / Greyed appearance with Approve & Deny button pair)
              if (isPending && isL1L2) {
                return (
                  <div
                    key={action.id}
                    className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/90 shadow-2xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Distinct locked appearance icon with tier pill instead of plain checkbox */}
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            action.approval_tier === 'L2' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                          title={`Locked: Requires ${action.approval_tier} Human Approval`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12px] font-semibold text-slate-900">
                              {action.title}
                            </span>
                            <span 
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                action.approval_tier === 'L2' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              Gate {action.approval_tier}
                            </span>
                          </div>
                          <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distinct Approve & Deny Button Pair */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                      <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                        <span>Awaiting analyst sign-off</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onApproveAction?.(currentCase.case_id, action.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title={`Approve ${action.title} as ${DEMO_ANALYST_NAME} (${action.approval_tier})`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDenyAction?.(currentCase.case_id, action.id)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title={`Deny ${action.title} as ${DEMO_ANALYST_NAME}`}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>Deny</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. L1/L2 ITEMS: APPROVED & EXECUTED (Turns green with inline stamp)
              if (isExecuted || isApproved) {
                const isSarAction = action.id === 'act_file_sar';

                return (
                  <div
                    key={action.id}
                    className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 shadow-2xs transition-all flex items-start gap-2.5 text-emerald-950"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 bg-emerald-600 text-white shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-semibold text-emerald-950">
                            {action.title}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                            {action.approval_tier} Executed
                          </span>
                        </div>

                        {/* SAR PDF Download button if SAR filing */}
                        {isSarAction && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSarPdf(currentCase, true);
                            }}
                            className="text-[10.5px] font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white/90 hover:bg-white px-2 py-0.5 rounded border border-indigo-200 transition-colors shrink-0 shadow-2xs"
                            title="Download SAR PDF report"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download SAR</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11.5px] text-emerald-800/80 mt-0.5 leading-snug">
                        {action.description}
                      </div>

                      {/* Small inline note: "Approved by [analyst_name] at [timestamp]" */}
                      <div className="mt-1.5 text-[10.5px] font-medium text-emerald-800 flex items-center gap-1.5 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded w-fit">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Approved by <strong>{action.decisionBy || DEMO_ANALYST_NAME}</strong> at {action.decisionAt || '18:24:10 UTC'} ({action.decisionTier || action.approval_tier})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // 4. L1/L2 ITEMS: DENIED (Turns red/muted, does not execute)
              if (isDenied) {
                return (
                  <div
                    key={action.id}
                    className="p-2.5 rounded-lg border border-rose-300 bg-rose-50/50 shadow-2xs transition-all flex items-start gap-2.5 opacity-90 text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 bg-rose-100 text-rose-700 border border-rose-300">
                      <X className="w-3 h-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12px] font-semibold text-rose-950 line-through">
                          {action.title}
                        </span>
                        <span className="text-[9.5px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded">
                          {action.approval_tier} Denied
                        </span>
                      </div>

                      <div className="text-[11.5px] text-rose-700/80 mt-0.5 leading-snug">
                        {action.description}
                      </div>

                      {/* Small inline note: "Denied by [analyst_name] at [timestamp]" */}
                      <div className="mt-1.5 text-[10.5px] font-medium text-rose-700 flex items-center gap-1.5 bg-white/90 border border-rose-200 px-2 py-0.5 rounded w-fit">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Denied by <strong>{action.decisionBy || DEMO_ANALYST_NAME}</strong> at {action.decisionAt || '18:24:10 UTC'} — Not Executed
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  </div>
  );
};
