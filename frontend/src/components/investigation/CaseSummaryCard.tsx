import React from 'react';
import { 
  CreditCard, 
  User, 
  Clock, 
  Play, 
  Activity, 
  Layers, 
  AlertTriangle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface CaseSummaryCardProps {
  currentCase: BenchmarkCase | null;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
}

function CircularAnomalyGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const radius = 17;
  const circumference = 2 * Math.PI * radius; // ~106.81
  const strokeDashoffset = circumference - (score * circumference);
  
  const strokeColor = score >= 0.75 
    ? '#E11D48' // Rose 600
    : score >= 0.45 
    ? '#D97706' // Amber 600
    : score > 0 
    ? '#059669' // Emerald 600
    : '#CBD5E1'; // Slate 300

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
        {/* Background track circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="3.5"
        />
        {/* Active progress circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={score > 0 ? strokeDashoffset : circumference}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
        />
      </svg>
      {/* Center percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
        <span 
          className="text-[11px] font-mono font-extrabold tracking-tighter leading-none"
          style={{ color: score > 0 ? strokeColor : '#94A3B8' }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
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
            {/* Standby Model Anomaly Box */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
              <CircularAnomalyGauge score={0} />
              <div className="flex flex-col min-w-[115px]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] font-mono">
                    Model Anomaly
                  </span>
                  <span className="font-mono font-medium text-slate-400 text-[11px]">0%</span>
                </div>
                <div className="flex items-center gap-1 my-1">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Engine Ready
                  </span>
                  <span className="text-[8.5px] font-medium text-slate-300 font-mono">Standby</span>
                </div>
              </div>
            </div>

            {/* Standby Uncertainty Box */}
            <div className="flex flex-col px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs min-w-[185px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                  <span className="uppercase text-[9px] tracking-wider font-mono">Uncertainty</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono bg-slate-100 text-slate-400 border border-slate-200">
                  IDLE
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-slate-200 rounded-full my-1 overflow-hidden">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10" style={{ left: '83%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono text-[9.5px]">
                  Sufficiency: <strong className="text-slate-400 font-normal">— / 2.5</strong>
                </span>
                <span className="text-[9px] font-semibold uppercase text-slate-400 font-mono">
                  Standby
                </span>
              </div>
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
          {/* Card 1: Modern Circular Model Anomaly Card */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
            <CircularAnomalyGauge score={initial_risk_score} />
            <div className="flex flex-col min-w-[115px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px] font-mono">
                  Model Anomaly
                </span>
                <span className={`font-mono font-black text-[11px] ${
                  initial_risk_score >= 0.75 
                    ? 'text-rose-600' 
                    : initial_risk_score >= 0.45 
                    ? 'text-amber-600' 
                    : 'text-emerald-600'
                }`}>
                  {initial_risk_score.toFixed(2)}
                </span>
              </div>

              {/* 3-tier risk segment pill indicator */}
              <div className="flex items-center gap-1 my-1">
                <div 
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    initial_risk_score > 0 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  title="Low Anomaly (<45%)"
                />
                <div 
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    initial_risk_score >= 0.45 ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                  title="Elevated Velocity (45% - 74%)"
                />
                <div 
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    initial_risk_score >= 0.75 ? 'bg-rose-500' : 'bg-slate-200'
                  }`}
                  title="Critical Anomaly (>=75%)"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-[9.5px] font-extrabold uppercase font-mono tracking-tight ${
                  initial_risk_score >= 0.75 
                    ? 'text-rose-600' 
                    : initial_risk_score >= 0.45 
                    ? 'text-amber-600' 
                    : 'text-emerald-600'
                }`}>
                  {initial_risk_score >= 0.75 ? 'Critical Deviance' : initial_risk_score >= 0.45 ? 'Elevated Velocity' : 'Baseline Normal'}
                </span>
                <span className="text-[8.5px] font-medium text-slate-400 font-mono">ML Score</span>
              </div>
            </div>
          </div>

          {/* Card 2: Modern Dynamic Uncertainty Meter & Sufficiency Card */}
          <div className={`flex flex-col px-3.5 py-1.5 rounded-xl border shadow-2xs min-w-[185px] transition-colors ${
            isLowUncertainty || isContradictory
              ? 'border-emerald-200/90 bg-emerald-50/30'
              : uncertainty === 'MEDIUM'
              ? 'border-amber-200/90 bg-amber-50/30'
              : 'border-rose-200/90 bg-rose-50/30'
          }`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className={`flex items-center gap-1 font-semibold ${
                isLowUncertainty || isContradictory
                  ? 'text-emerald-700'
                  : uncertainty === 'MEDIUM'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}>
                {isLowUncertainty || isContradictory ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.3]" />
                ) : uncertainty === 'MEDIUM' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 stroke-[2.3]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 stroke-[2.3]" />
                )}
                <span className="uppercase text-[9px] tracking-wider font-mono">Uncertainty</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono ${
                isLowUncertainty || isContradictory
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : uncertainty === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {uncertainty}
              </span>
            </div>

            {/* Sufficiency Progress Bar with Threshold Marker */}
            <div className="relative w-full h-1.5 bg-slate-200/80 rounded-full my-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isContradictory ? 'bg-emerald-500' : isSufficient ? 'bg-indigo-600' : 'bg-amber-500'
                }`}
                style={{ width: `${scorePct}%` }}
              />
              {/* Threshold tick at 2.5 on a 3.0 scale */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                style={{ left: `${thresholdPct}%` }}
                title="Sufficiency Threshold 2.5"
              />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-mono text-[9.5px]">
                Sufficiency: <strong className="text-slate-900">{uncertainty_dimensions.calculated_score.toFixed(1)}</strong> / {uncertainty_dimensions.threshold}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono ${
                isContradictory
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isSufficient
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {uncertainty_dimensions.status}
              </span>
            </div>
          </div>

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
