import React, { useState, useEffect, useRef } from 'react';
import type { ExecutionStep } from '../../types/investigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TerminalLine {
  id: string;
  text: string;
  type: 'system' | 'info' | 'success' | 'warn' | 'error' | 'mcp' | 'divider' | 'blank';
  done: boolean; // typing animation complete
}

interface InvestigationTerminalProps {
  isOpen: boolean;
  steps: ExecutionStep[];
  isInvestigating: boolean;
  caseId: string;
  onClose: () => void;
}

// ─── Color map by line type ───────────────────────────────────────────────────

const typeColor: Record<TerminalLine['type'], string> = {
  system:  'text-slate-400',
  info:    'text-cyan-300',
  success: 'text-emerald-400',
  warn:    'text-amber-400',
  error:   'text-rose-400',
  mcp:     'text-violet-400',
  divider: 'text-slate-600',
  blank:   'text-transparent',
};

// ─── Build terminal lines from execution steps ────────────────────────────────

function buildLinesForStep(step: ExecutionStep, stepIndex: number): TerminalLine[] {
  const ts = step.timestamp ?? new Date().toISOString().slice(11, 19);
  const lines: TerminalLine[] = [];

  const push = (text: string, type: TerminalLine['type'] = 'info') => {
    lines.push({ id: `${stepIndex}-${lines.length}`, text, type, done: false });
  };

  push('', 'blank');
  push(`─── Step ${stepIndex + 1}/${5}: ${step.title} ─────────────────────────────────────────────────────────`, 'divider');
  push(`[${ts}]  ${step.subtitle}`, 'system');
  push(`> ${step.details}`, 'info');

  if (step.mcpCall) {
    push(`  ↪ MCP CALL  ${step.mcpCall.tool}  (${step.mcpCall.latencyMs}ms)`, 'mcp');
    push(`  ↪ RESULT    ${step.mcpCall.summary}`, 'mcp');
  }

  if (step.outputSnippet) {
    push(`  $ ${step.outputSnippet}`, 'success');
  }

  return lines;
}

// ─── Typing animation hook ────────────────────────────────────────────────────

const CHAR_SPEED_MS = 8; // ms per character

function useTypingLine(fullText: string, enabled: boolean): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!enabled) { setDisplayed(fullText); return; }
    setDisplayed('');
    if (!fullText) return;
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(tick);
    }, CHAR_SPEED_MS);
    return () => clearInterval(tick);
  }, [fullText, enabled]);

  return displayed;
}

// ─── Single animated line ─────────────────────────────────────────────────────

const TerminalLineRow: React.FC<{ line: TerminalLine; animate: boolean }> = ({ line, animate }) => {
  const text = useTypingLine(line.text, animate);

  if (line.type === 'blank') return <div className="h-2" />;
  if (line.type === 'divider') {
    return (
      <div className="text-[11px] font-mono text-slate-600 leading-tight select-none truncate">
        {animate ? text : line.text}
      </div>
    );
  }

  return (
    <div className={`text-[12px] font-mono leading-snug whitespace-pre-wrap break-all ${typeColor[line.type]}`}>
      {animate ? text : line.text}
      {animate && text.length < line.text.length && (
        <span className="inline-block w-[7px] h-[13px] bg-current align-middle ml-px animate-pulse" />
      )}
    </div>
  );
};

// ─── Main terminal component ──────────────────────────────────────────────────

export const InvestigationTerminal: React.FC<InvestigationTerminalProps> = ({
  isOpen,
  steps,
  isInvestigating,
  caseId,
  onClose,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [animatingLineId, setAnimatingLineId] = useState<string | null>(null);
  const [height, setHeight] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── Keyboard close ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Auto-scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  // ── Resize drag ─────────────────────────────────────────────────────────────
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartH.current = height;
  };
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = dragStartY.current - e.clientY;
      setHeight(Math.max(180, Math.min(window.innerHeight * 0.8, dragStartH.current + delta)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  // ── Investigation sequence: stream lines one step at a time ─────────────────
  useEffect(() => {
    if (!isInvestigating || steps.length === 0) return;

    setLines([]);
    setAnimatingLineId(null);

    const header: TerminalLine[] = [
      { id: 'h0', text: '', type: 'blank', done: true },
      { id: 'h1', text: `╔══════════════════════════════════════════════════════════════════════════╗`, type: 'divider', done: true },
      { id: 'h2', text: `  ORBIT FRAUD INVESTIGATOR  //  Case: ${caseId}  //  ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`, type: 'system', done: true },
      { id: 'h3', text: `╚══════════════════════════════════════════════════════════════════════════╝`, type: 'divider', done: true },
    ];
    setLines(header);

    let delay = 400;

    steps.forEach((step, stepIndex) => {
      const stepLines = buildLinesForStep(step, stepIndex);

      stepLines.forEach((line, lineIndex) => {
        setTimeout(() => {
          setLines(prev => [...prev, line]);
          setAnimatingLineId(line.id);
        }, delay);
        // Each line takes ~(text.length * CHAR_SPEED_MS) + 40ms gap before next
        delay += Math.max(60, line.text.length * CHAR_SPEED_MS) + 40;
      });

      // 1-second pause between steps (after all lines of this step finish)
      delay += 1000;
    });

    // Footer after all steps
    const footerDelay = delay;
    setTimeout(() => {
      setLines(prev => [
        ...prev,
        { id: 'f0', text: '', type: 'blank', done: true },
        { id: 'f1', text: '════════════════════════════════════════════════════════════════════════════', type: 'divider', done: true },
        { id: 'f2', text: `  ✓ Investigation complete. All steps resolved.`, type: 'success', done: true },
        { id: 'f3', text: `  $ orbit-agent --status finished --case ${caseId}`, type: 'system', done: true },
        { id: 'f4', text: '', type: 'blank', done: true },
      ]);
      setAnimatingLineId(null);
    }, footerDelay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvestigating]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col shadow-2xl"
      style={{ height: `${height}px` }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="h-1.5 bg-[#2a2a2a] hover:bg-violet-600 transition-colors cursor-ns-resize shrink-0 select-none"
        title="Drag to resize terminal"
      />

      {/* Title bar — Windows Terminal style */}
      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-1.5 shrink-0 border-b border-[#333]">
        {/* Left: traffic-light dots + tab */}
        <div className="flex items-center gap-2">
          {/* Dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 cursor-pointer" onClick={onClose} title="Close (Esc)" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {/* Tab */}
          <div className="flex items-center gap-1.5 bg-[#0c0c0c] px-3 py-1 rounded-t text-[11px] font-mono text-slate-300 border border-[#333] border-b-[#0c0c0c] -mb-[1px]">
            <span className="text-violet-400">▶</span>
            <span>orbit-agent — {caseId}</span>
          </div>
        </div>

        {/* Right: close */}
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-[13px] font-mono px-1.5 transition-colors"
          title="Close terminal (Esc)"
        >
          ×
        </button>
      </div>

      {/* Terminal body */}
      <div
        ref={bodyRef}
        className="flex-1 bg-[#0c0c0c] overflow-y-auto px-4 py-3 font-mono"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #0c0c0c' }}
      >
        {lines.length === 0 && (
          <div className="text-[12px] text-slate-600 font-mono mt-2">
            {isInvestigating
              ? 'Initializing investigation sequence...'
              : `$ orbit-agent ready — press Run Investigation to begin`}
          </div>
        )}

        {lines.map((line) => (
          <TerminalLineRow
            key={line.id}
            line={line}
            animate={line.id === animatingLineId}
          />
        ))}

        {/* Blinking cursor at end when idle */}
        {!isInvestigating && lines.length > 0 && (
          <div className="text-[12px] font-mono text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-violet-400">$</span>
            <span className="inline-block w-[7px] h-[14px] bg-slate-400 align-middle animate-[blink_1s_step-end_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
};
