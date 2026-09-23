import React from 'react';
import { 
  CreditCard, 
  User, 
  Clock, 
  Play, 
  Activity, 
  Layers
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface CaseSummaryCardProps {
  currentCase: BenchmarkCase | null;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
}


export const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({
  currentCase,
  isInvestigating,
  onRunInvestigation,
}) => {
  if (!currentCase) {
    return (
      <div className="bg-white border-b border-slate-200 px-4 py-2 select-none">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[26px] font-bold text-slate-300 font-mono tracking-tight leading-none">
                $—
              </span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                Awaiting Case
              </span>
              <span className="text-slate-300 font-mono text-[12.5px] font-normal tracking-tight">
                TXN —
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-400 font-mono mt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 font-normal">Account:</span>
                <span className="text-slate-400 font-normal">—</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 font-normal">Card:</span>
                <span className="text-slate-400 font-normal">—</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 font-normal">Time:</span>
                <span className="text-slate-400 font-normal">—</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 font-normal">Typology:</span>
                <span className="text-slate-400 font-normal">Standby</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Standby Model Anomaly Card — flat structure, no ring */}
            <div className="flex flex-col px-5 py-[10px] rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs min-w-[145px]">
              {/* Header row: title left, badge right */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
                  Model anomaly
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                  Idle
                </span>
              </div>
              {/* Primary metric — large and unambiguous */}
              <div className="text-[22px] font-bold font-mono text-slate-300 leading-none mt-3 mb-3">
                0.00
              </div>
              {/* Single flat progress bar — minimum 12px margin above (from metric) and below (to caption) */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 mb-3" />
              {/* Caption — one line, muted */}
              <span className="text-[11px] text-slate-400 font-mono">ML score</span>
            </div>

            {/* Standby Uncertainty Card — same card structure as Model Anomaly */}
            <div className="flex flex-col px-5 py-[10px] rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs min-w-[175px]">
              {/* Header row: title left, badge right */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
                  Uncertainty
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                  Idle
                </span>
              </div>
              {/* Primary metric — sufficiency ratio, large */}
              <div className="text-[22px] font-bold font-mono text-slate-300 leading-none mt-3 mb-3">
                — / 2.5
              </div>
              {/* Single flat progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 mb-3" />
              {/* Verdict caption — plain muted text, NOT a badge */}
              <span className="text-[11px] text-slate-400 font-mono">Standby</span>
            </div>

            <button
              disabled
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[12px] font-medium cursor-not-allowed shadow-2xs shrink-0"
              title="Select a case from the left dropdown to run investigation"
            >
              <Play className="w-3 h-3 fill-slate-300 text-slate-300" />
              <span>Run Investigation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { initial_risk_score, uncertainty_dimensions, post_evidence_uncertainty, pre_evidence_uncertainty } = currentCase;
  const uncertainty = post_evidence_uncertainty || pre_evidence_uncertainty || 'HIGH';
  const isLowUncertainty = uncertainty === 'LOW';
  const isContradictory = uncertainty_dimensions.status === 'CONTRADICTORY';
  const isSufficient = uncertainty_dimensions.status === 'SUFFICIENT';

  // Calculate score percentage against 3.0 scale for visual gauge
  const scorePct = Math.min(Math.max((uncertainty_dimensions.calculated_score / 3.0) * 100, 4), 100);
  const thresholdPct = (uncertainty_dimensions.threshold / 3.0) * 100; // ~83.3%

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 select-none">
      {/* Row 1: Left Amount + Category + Txn; Right Gauges + CTA */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Money, Category pill, Txn ID */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[26px] font-extrabold text-slate-900 font-mono tracking-tight leading-none">
              ${currentCase.amount_usd.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200/80">
              {currentCase.evidence_pack.transaction_context.product_cd}
            </span>
            <span className="text-slate-400 font-mono text-[13px] font-semibold tracking-tight">
              {currentCase.transaction_id}
            </span>
          </div>

          {/* Sub-row: Acct, Card, Time, Typology matching Image 3 */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-500 font-mono mt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-normal">Account:</span>
              <strong className="text-slate-900 font-semibold">{currentCase.account_id}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-normal">Card:</span>
              <strong className="text-slate-900 font-semibold">{currentCase.card_id}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-normal">Time:</span>
              <strong className="text-slate-800 font-semibold">{currentCase.timestamp}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 font-normal">Typology:</span>
              <strong className="text-indigo-700 font-bold">{currentCase.primary_pattern}</strong>
            </span>
          </div>
        </div>

        {/* Right: Model Anomaly Card, Uncertainty Meter Card & Run CTA */}
        <div className="flex items-center gap-3">
          {/* Card 1: Model Anomaly — flat card, no ring */}
          {(() => {
            const anomalySeverity = initial_risk_score >= 0.75 ? 'Critical' : initial_risk_score >= 0.45 ? 'Elevated' : 'Normal';
            const anomalyBarColor = initial_risk_score >= 0.75 ? 'bg-rose-500' : initial_risk_score >= 0.45 ? 'bg-amber-500' : 'bg-emerald-500';
            const anomalyBadgeStyle = initial_risk_score >= 0.75
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : initial_risk_score >= 0.45
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';
            return (
              <div className="flex flex-col px-5 py-[10px] rounded-xl border border-slate-200/90 bg-white shadow-2xs min-w-[145px]">
                {/* Header row: title left, one severity badge right */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 font-mono uppercase tracking-wider">
                    Model anomaly
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${anomalyBadgeStyle}`}>
                    {anomalySeverity}
                  </span>
                </div>
                {/* Primary metric — large flat number, most visual weight */}
                <div className={`text-[22px] font-bold font-mono leading-none mt-3 mb-3 ${
                  initial_risk_score >= 0.75 ? 'text-rose-600' : initial_risk_score >= 0.45 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {initial_risk_score.toFixed(2)}
                </div>
                {/* Single flat progress bar — no segments, no gradients */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${anomalyBarColor}`}
                    style={{ width: `${Math.round(initial_risk_score * 100)}%` }}
                  />
                </div>
                {/* Caption — one line only */}
                <span className="text-[11px] text-slate-400 font-mono">ML score</span>
              </div>
            );
          })()}

          {/* Card 2: Uncertainty — same card structure as Model Anomaly */}
          {(() => {
            const uncertaintyBadgeStyle = isLowUncertainty || isContradictory
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : uncertainty === 'MEDIUM'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200';
            const uncertaintyBarColor = isContradictory ? 'bg-emerald-500' : isSufficient ? 'bg-indigo-500' : 'bg-amber-500';
            // Capitalize the uncertainty label: HIGH → High
            const uncertaintyLabel = uncertainty.charAt(0) + uncertainty.slice(1).toLowerCase();
            // Verdict as plain text — not a badge
            const verdictLabel = uncertainty_dimensions.status.charAt(0) + uncertainty_dimensions.status.slice(1).toLowerCase();
            return (
              <div className="flex flex-col px-5 py-[10px] rounded-xl border border-slate-200/90 bg-white shadow-2xs min-w-[175px]">
                {/* Header row: title left, one uncertainty badge right */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 font-mono uppercase tracking-wider">
                    Uncertainty
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${uncertaintyBadgeStyle}`}>
                    {uncertaintyLabel}
                  </span>
                </div>
                {/* Primary metric — sufficiency ratio, large */}
                <div className="text-[22px] font-bold font-mono text-slate-800 leading-none mt-3 mb-3">
                  {uncertainty_dimensions.calculated_score.toFixed(1)}&thinsp;/&thinsp;{uncertainty_dimensions.threshold}
                </div>
                {/* Single flat progress bar with threshold marker */}
                <div className="relative w-full h-1.5 rounded-full bg-slate-200 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${uncertaintyBarColor}`}
                    style={{ width: `${scorePct}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
                    style={{ left: `${thresholdPct}%` }}
                    title="Sufficiency threshold 2.5"
                  />
                </div>
                {/* Verdict — plain muted text, NOT a second badge */}
                <span className="text-[11px] text-slate-400 font-mono">{verdictLabel}</span>
              </div>
            );
          })()}

          {/* Run Autonomous Investigation Button */}
          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs shrink-0"
            title="Execute LangGraph Autonomous Investigation Cycle"
          >
            {isInvestigating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Investigating…</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Run Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
