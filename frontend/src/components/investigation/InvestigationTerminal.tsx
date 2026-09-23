import React, { useState, useEffect, useRef } from 'react';
import type { ExecutionStep } from '../../types/investigation';

interface InvestigationTerminalProps {
  isOpen: boolean;
  steps: ExecutionStep[];
  isInvestigating: boolean;
  onClose: () => void;
}

interface OutputLine {
  key: string;
  text: string;
  color: string;
}

// What each step produces as terminal output — step name then result only
function linesForStep(step: ExecutionStep, idx: number, total: number): OutputLine[] {
  const out: OutputLine[] = [];

  // Running line
  out.push({
    key: `${idx}-run`,
    text: `[${idx + 1}/${total}] Running: ${step.title}`,
    color: '#64B5F6', // blue — "what is running"
  });

  // Result line — the actual output/details
  const resultText = step.outputSnippet
    ? `    → ${step.outputSnippet}`
    : `    → ${step.details}`;
  out.push({
    key: `${idx}-result`,
    text: resultText,
    color: '#A5D6A7', // green — "what result is coming"
  });

  // MCP call if present
  if (step.mcpCall) {
    out.push({
      key: `${idx}-mcp`,
      text: `    ↪ ${step.mcpCall.tool}  [${step.mcpCall.latencyMs}ms]`,
      color: '#CE93D8', // violet — tool call
    });
  }

  return out;
}

export const InvestigationTerminal: React.FC<InvestigationTerminalProps> = ({
  isOpen,
  steps,
  isInvestigating,
  onClose,
}) => {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Stream lines when investigation starts
  useEffect(() => {
    if (!isInvestigating || steps.length === 0) return;

    setLines([]); // clear on each new run

    let delay = 0;

    steps.forEach((step, idx) => {
      const stepLines = linesForStep(step, idx, steps.length);

      stepLines.forEach((line, lineIdx) => {
        setTimeout(() => {
          setLines(prev => [...prev, line]);
        }, delay + lineIdx * 80);
      });

      // 1-second gap between steps
      delay += stepLines.length * 80 + 1000;
    });

    // Done line
    setTimeout(() => {
      setLines(prev => [
        ...prev,
        { key: 'done', text: '✓ Investigation complete.', color: '#A5D6A7' },
      ]);
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvestigating]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (!isOpen) return null;

  return (
    <div className="shrink-0 border-t border-[#1e1e1e] flex flex-col" style={{ height: '220px', background: '#0C0C0C' }}>
      {/* Minimal header bar */}
      <div
        className="flex items-center justify-between px-3 py-1 shrink-0"
        style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>
          TERMINAL
        </span>
        <button
          onClick={onClose}
          style={{ fontFamily: 'monospace', fontSize: '14px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#555')}
        >
          ×
        </button>
      </div>

      {/* Output — only running + result lines */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #0c0c0c' }}
      >
        {lines.length === 0 && (
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#444' }}>
            {isInvestigating ? 'Starting...' : '$ ready'}
          </span>
        )}

        {lines.map(line => (
          <div
            key={line.key}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              color: line.color,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {line.text}
          </div>
        ))}

        {/* Blinking cursor */}
        {!isInvestigating && lines.length > 0 && (
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', marginTop: '4px' }}>
            $ <span style={{ display: 'inline-block', width: '7px', height: '13px', background: '#888', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
