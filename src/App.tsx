import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { CaseQueuePanel } from './components/queue/CaseQueuePanel';
import { CaseSummaryCard } from './components/investigation/CaseSummaryCard';
import { GraphCanvas } from './components/investigation/GraphCanvas';
import { AgentStepper } from './components/investigation/AgentStepper';
import { NbaProgressionCard } from './components/decision/NbaProgressionCard';
import { PolicyAccordion } from './components/decision/PolicyAccordion';
import { SarGenerator } from './components/decision/SarGenerator';
import { ApprovalActionBar } from './components/decision/ApprovalActionBar';
import { LlmInspectorModal } from './components/modals/LlmInspectorModal';
import { ExportSubmissionModal } from './components/modals/ExportSubmissionModal';
import { BENCHMARK_CASES } from './data/benchmarkCases';
import type { BenchmarkCase } from './types/investigation';

export const App: React.FC = () => {
  const [cases, setCases] = useState<BenchmarkCase[]>(BENCHMARK_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(BENCHMARK_CASES[0].case_id);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5);
  const [isLlmInspectorOpen, setIsLlmInspectorOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Active case accessor
  const activeCase = cases.find(c => c.case_id === activeCaseId) || cases[0];

  // Select case handler
  const handleSelectCase = (caseItem: BenchmarkCase) => {
    setActiveCaseId(caseItem.case_id);
    setActiveStepIndex(5);
  };

  // Run autonomous investigation simulation with realistic micro-delays
  const handleRunAutonomousInvestigation = () => {
    if (isInvestigating) return;
    setIsInvestigating(true);
    setActiveStepIndex(0);

    const stepIntervals = [500, 900, 800, 1100, 700];
    let cumulative = 0;

    stepIntervals.forEach((duration, idx) => {
      cumulative += duration;
      setTimeout(() => {
        setActiveStepIndex(idx + 1);
        if (idx === stepIntervals.length - 1) {
          setIsInvestigating(false);
        }
      }, cumulative);
    });
  };

  // Human-in-the-loop: Approve Action
  const handleApproveAction = (actionName: string) => {
    setCases(prev => prev.map(c => {
      if (c.case_id === activeCase.case_id) {
        return {
          ...c,
          status: actionName.toLowerCase().includes('clear') ? 'resolved_cleared' : 'resolved_fraud',
          sar_status: 'Cleared'
        };
      }
      return c;
    }));
  };

  // Human-in-the-loop: Override Action
  const handleOverrideAction = (overrideName: string) => {
    setCases(prev => prev.map(c => {
      if (c.case_id === activeCase.case_id) {
        return {
          ...c,
          post_evidence_nba: {
            ...c.post_evidence_nba,
            action: `[OVERRIDDEN] ${overrideName}`,
            approval_route: 'Manual Analyst Override',
            rationale: `Analyst manually adjusted recommended action to: ${overrideName}`
          }
        };
      }
      return c;
    }));
  };

  // Human-in-the-loop: Mark False Positive
  const handleCloseFalsePositive = () => {
    setCases(prev => prev.map(c => {
      if (c.case_id === activeCase.case_id) {
        return {
          ...c,
          status: 'resolved_cleared',
          sar_status: 'Cleared',
          post_evidence_uncertainty: 'LOW',
          uncertainty_dimensions: {
            ...c.uncertainty_dimensions,
            status: 'CONTRADICTORY',
            contradictory_evidence: 3
          }
        };
      }
      return c;
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Top Bar matching Image 1 */}
      <Header
        activeCase={activeCase}
        allCases={cases}
        onSelectCase={handleSelectCase}
      />

      {/* 3-Column Cockpit Grid (260px minmax 340px) */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Column 1: Case Queue (260px) */}
        <section className="w-[260px] shrink-0 h-full overflow-hidden" aria-label="Investigation Queue">
          <CaseQueuePanel
            cases={cases}
            activeCaseId={activeCase.case_id}
            onSelectCase={handleSelectCase}
            isInvestigating={isInvestigating}
          />
        </section>

        {/* Column 2: Investigation Core (minmax flex-1) */}
        <section className="flex-1 flex flex-col h-full min-w-0 bg-white border-r border-slate-200 overflow-hidden" aria-label="Investigation Core">
          {/* Top Summary Card */}
          <CaseSummaryCard
            currentCase={activeCase}
            isInvestigating={isInvestigating}
            onRunInvestigation={handleRunAutonomousInvestigation}
          />

          {/* Interactive Topology Graph Canvas with Node Inspector */}
          <div className="flex-1 min-h-0 relative flex flex-col">
            <GraphCanvas
              nodes={activeCase.graph_nodes}
              edges={activeCase.graph_edges}
              caseId={activeCase.case_id}
              isInvestigating={isInvestigating}
            />
          </div>

          {/* Stepper Feed */}
          <AgentStepper
            steps={activeCase.execution_steps}
            isInvestigating={isInvestigating}
            activeStepIndex={activeStepIndex}
          />
        </section>

        {/* Column 3: Decision Engine, Policy Gates & SAR (340px) */}
        <section className="w-[340px] shrink-0 h-full flex flex-col bg-slate-50/70 overflow-hidden" aria-label="Decision Engine and Policy Gates">
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* Next-Best Action Progression */}
            <NbaProgressionCard
              preNba={activeCase.pre_evidence_nba}
              evidenceInjected={activeCase.evidence_injected}
              postNba={activeCase.post_evidence_nba}
              isInvestigating={isInvestigating}
            />

            {/* Policy Citations */}
            <PolicyAccordion
              evidencePack={activeCase.evidence_pack}
            />

            {/* SAR Generator */}
            <SarGenerator
              sarReport={activeCase.sar_report}
              caseId={activeCase.case_id}
              sarStatus={activeCase.sar_status || (activeCase.status.startsWith('resolved') ? 'Cleared' : 'Pending')}
              onStatusChange={(newStatus) => {
                setCases(prev => prev.map(c => 
                  c.case_id === activeCase.case_id 
                    ? { ...c, sar_status: newStatus } 
                    : c
                ));
              }}
            />
          </div>

          {/* Approval Action Bar */}
          <ApprovalActionBar
            currentCase={activeCase}
            onApproveAction={handleApproveAction}
            onOverrideAction={handleOverrideAction}
            onCloseFalsePositive={handleCloseFalsePositive}
            isInvestigating={isInvestigating}
          />
        </section>
      </main>

      {/* Person B LLM Investigator Prompts & Output Schema Inspector Modal */}
      <LlmInspectorModal
        isOpen={isLlmInspectorOpen}
        onClose={() => setIsLlmInspectorOpen(false)}
        activeCase={activeCase}
      />

      {/* 20-Case Benchmark Official JSON Submission Exporter Modal */}
      <ExportSubmissionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cases={cases}
      />
    </div>
  );
};

export default App;
