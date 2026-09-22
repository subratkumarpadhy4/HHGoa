import React from 'react';
import { 
  CreditCard, 
  User, 
  Clock, 
  Play, 
  Activity,
  Layers,
  AlertTriangle
} from 'lucide-react';
import type { BenchmarkCase } from '../../types/investigation';

interface CaseSummaryCardProps {
  currentCase: BenchmarkCase;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
}

function MiniNeedleGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const angle = -90 + score * 180;
  const color = score >= 0.75 ? '#E11D48' : score >= 0.45 ? '#D97706' : '#059669';

  return (
    <svg width="44" height="28" viewBox="0 0 44 28" className="shrink-0">
      <path
        d="M4 25 A18 18 0 0 1 40 25"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M4 25 A18 18 0 0 1 40 25"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${pct * 0.56} 120`}
        style={{ transition: 'stroke-dasharray .5s ease' }}
      />
      <g transform={`translate(22 25) rotate(${angle})`} style={{ transition: 'transform .5s ease' }}>
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <circle cx="22" cy="25" r="2" fill="#E11D48" />
    </svg>
  );
}

export const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({
  currentCase,
  isInvestigating,
  onRunInvestigation,
}) => {
  const { initial_risk_score, uncertainty_dimensions, post_evidence_uncertainty, pre_evidence_uncertainty } = currentCase;
  const uncertainty = post_evidence_uncertainty || pre_evidence_uncertainty || 'HIGH';
  const pctAnomaly = Math.round(initial_risk_score * 100);

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3 select-none">
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-500 font-mono mt-2">
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
          {/* Card 1: Model Anomaly Gauge Box */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-xs">
            <MiniNeedleGauge score={initial_risk_score} />
            <div className="flex flex-col">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between gap-1">
                <span>Model Anomaly</span>
                <span className="mono font-bold text-slate-900">{pctAnomaly}%</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${pctAnomaly}%` }}
                />
              </div>
              <div className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider mt-1 font-mono">
                {initial_risk_score >= 0.75 ? 'CRITICAL ANOMALY' : 'ELEVATED RISK'}
              </div>
            </div>
          </div>

          {/* Card 2: Uncertainty Meter & Sufficiency Box */}
          <div className="flex flex-col px-3 py-1.5 rounded-lg border border-rose-200/80 bg-rose-50/30 shadow-xs min-w-[170px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <AlertTriangle className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                <span>Uncertainty Meter</span>
              </span>
              <span className="font-extrabold text-rose-600 font-mono text-[11px]">{uncertainty}</span>
            </div>
            <div className="w-full h-1 bg-rose-600 rounded-full my-1" />
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-slate-600 font-mono text-[10px]">
                Sufficiency: <strong className="text-slate-900">{uncertainty_dimensions.calculated_score.toFixed(1)}</strong> / {uncertainty_dimensions.threshold}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
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

