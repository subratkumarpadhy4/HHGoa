import { useState } from 'react';
import { 
  ChevronRight, 
  Lock 
} from 'lucide-react';
import type { EvidencePack } from '../../types/investigation';

interface PolicyAccordionProps {
  evidencePack: EvidencePack;
}

export const PolicyAccordion: React.FC<PolicyAccordionProps> = ({ evidencePack }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const policies = evidencePack.policy_rules;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 select-none">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-slate-500" />
        <span>Policy & Typology Citations</span>
      </div>

      <div className="space-y-1.5">
        {policies.map((p) => {
          const isOpen = openId === p.rule_id;

          return (
            <div key={p.rule_id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : p.rule_id)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-50 text-left transition-colors"
              >
                <span className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                  <span className="mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                    {p.rule_id}
                  </span>
                  <span>{p.title}</span>
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3 py-2.5 text-[11.5px] text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100">
                  {p.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
