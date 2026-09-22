import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { CaseTabBar } from './components/layout/CaseTabBar';
import { CaseSummaryCard } from './components/investigation/CaseSummaryCard';
import { GraphCanvas } from './components/investigation/GraphCanvas';
import { AgentStepper } from './components/investigation/AgentStepper';
import { NbaProgressionCard } from './components/decision/NbaProgressionCard';
import { PolicyAccordion } from './components/decision/PolicyAccordion';
import { SarGenerator } from './components/decision/SarGenerator';
import { LlmInspectorModal } from './components/modals/LlmInspectorModal';
import { ExportSubmissionModal } from './components/modals/ExportSubmissionModal';
import { BENCHMARK_CASES } from './data/benchmarkCases';
import type { BenchmarkCase } from './types/investigation';

export const App: React.FC = () => {
  const [cases, setCases] = useState<BenchmarkCase[]>(BENCHMARK_CASES);
  const [openCaseIds, setOpenCaseIds] = useState<string[]>([
    BENCHMARK_CASES[0].case_id,
    BENCHMARK_CASES[1].case_id
  ]);
  const [activeCaseId, setActiveCaseId] = useState<string>(BENCHMARK_CASES[0].case_id);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5);
  const [isLlmInspectorOpen, setIsLlmInspectorOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Active case accessor
  const activeCase = cases.find(c => c.case_id === activeCaseId) || cases[0];

  // Select tab handler (switching between already open cases)
  const handleSelectTab = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveStepIndex(5);
  };

  // Open case from dropdown (adds as a new tab if not open, and switches to it in the same window)
  const handleOpenCase = (caseId: string) => {
    if (!openCaseIds.includes(caseId)) {
      setOpenCaseIds(prev => [...prev, caseId]);
    }
    setActiveCaseId(caseId);
    setActiveStepIndex(5);
  };

  // Close tab handler
  const handleCloseTab = (caseId: string) => {
    if (openCaseIds.length <= 1) return; // Keep at least one tab open
    const newOpenIds = openCaseIds.filter(id => id !== caseId);
    setOpenCaseIds(newOpenIds);
    if (activeCaseId === caseId) {
      setActiveCaseId(newOpenIds[newOpenIds.length - 1]);
      setActiveStepIndex(5);
    }
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Top Header: Platform Branding */}
      <Header />

      {/* Browser-Styled Case Tab Bar with Colored Status Dots & Right-Aligned Dropdown */}
      <CaseTabBar
        openCaseIds={openCaseIds}
        activeCaseId={activeCase.case_id}
        allCases={cases}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onOpenCase={handleOpenCase}
      />

      {/* Main Investigation Workspace: Investigation Core (flex-1) + Decision & SAR (340px) */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Investigation Core */}
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

        {/* Right Decision Engine, Policy Gates & SAR (340px) */}
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

            {/* Suspicious Activity Report (SAR) */}
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
        </section>
      </main>

      {/* Modals preserved if needed */}
      <LlmInspectorModal
        isOpen={isLlmInspectorOpen}
        onClose={() => setIsLlmInspectorOpen(false)}
        activeCase={activeCase}
      />

      <ExportSubmissionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cases={cases}
      />
    </div>
  );
};

export default App;
