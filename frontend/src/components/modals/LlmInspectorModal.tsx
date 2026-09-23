import { useState } from 'react';
import { 
  X, 
  FileCode2, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Code2, 
  Sparkles
} from 'lucide-react';
import { 
  LLM_INVESTIGATOR_SYSTEM_PROMPT, 
  LLM_INVESTIGATOR_OUTPUT_SCHEMA, 
  RECOMMEND_ACTION_SYSTEM_PROMPT 
} from '../../data/llmSpecs';
import type { BenchmarkCase } from '../../types/investigation';

interface LlmInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: BenchmarkCase;
}

type TabType = 'prompts' | 'schema' | 'evidence_pack' | 'mcp_tools';

export const LlmInspectorModal: React.FC<LlmInspectorModalProps> = ({
  isOpen,
  onClose,
  activeCase,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompts');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-popup border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200/60">
              <FileCode2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Person B: LLM Reasoning Layer & Schema Inspector
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  Frozen Architecture v5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Investigation Prompt Design, Structured Output Schema & Evidence Pack Traceability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-slate-200 bg-white text-xs font-medium space-x-6">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'prompts'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>LLM Investigator Prompts</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Structured Output Schema (JSON)</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence_pack')}
            className={`py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'evidence_pack'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evidence Pack Payload</span>
          </button>
          <button
            onClick={() => setActiveTab('mcp_tools')}
            className={`py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'mcp_tools'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>TigerGraph MCP Tool Surface</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    1. llm_investigate System Prompt
                  </h4>
                  <button
                    onClick={() => copyToClipboard(LLM_INVESTIGATOR_SYSTEM_PROMPT)}
                    className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Prompt</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {LLM_INVESTIGATOR_SYSTEM_PROMPT}
                </pre>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    2. recommend_action System Prompt
                  </h4>
                  <button
                    onClick={() => copyToClipboard(RECOMMEND_ACTION_SYSTEM_PROMPT)}
                    className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {RECOMMEND_ACTION_SYSTEM_PROMPT}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Structured Output Contract (JSON Schema Draft 7)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Enforces strict outputs: findings trace to evidence, closed vocabulary for missing_evidence.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(LLM_INVESTIGATOR_OUTPUT_SCHEMA, null, 2))}
                  className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Schema</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {JSON.stringify(LLM_INVESTIGATOR_OUTPUT_SCHEMA, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'evidence_pack' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Active Case Evidence Pack: {activeCase.case_id}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Structured JSON compiled deterministically from TigerGraph before being sent to the LLM.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(activeCase.evidence_pack, null, 2))}
                  className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {JSON.stringify(activeCase.evidence_pack, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'mcp_tools' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Validated GSQL MCP Tool Surface
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    TigerGraph official MCP protocol endpoints. Agent NEVER generates runtime GSQL.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Protocol Validated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { tool: 'get_transaction_context(txn_id)', desc: 'Fetches transaction vertex & immediate 1-hop connected neighbors' },
                  { tool: 'find_connected_entities(account_id, depth)', desc: 'Traverses multi-hop accounts, devices, emails, IP addresses' },
                  { tool: 'detect_pattern(seed, pattern_name)', desc: 'Executes validated GSQL typology detector (SharedDeviceRing, etc.)' },
                  { tool: 'find_similar_cases(investigation_context, k)', desc: 'Surfaces related (exact-entity) & similar (multi-dim) resolved cases' },
                  { tool: 'retrieve_policy(investigation_type, risk_level, ...)', desc: 'GraphRAG semantic retrieval over bank fraud policy vectors' },
                  { tool: 'close_case(case_id, outcome)', desc: 'Spawns immutable ResolvedCase node in TigerGraph Case Memory' }
                ].map((item) => (
                  <div key={item.tool} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-mono font-bold text-indigo-700 text-[11px]">
                      {item.tool}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Person B Deliverables: Prompts, Schemas, Traceability & Four-Panel Interface</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
