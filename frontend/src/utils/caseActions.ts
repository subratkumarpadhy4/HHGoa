import type { BenchmarkCase, CaseAction, CaseStatus } from '../types/investigation';

export const DEMO_ANALYST_NAME = 'J. Smith';

export function isCaseFraud(caseItem: BenchmarkCase): boolean {
  return (
    caseItem.initial_risk_score >= 0.75 ||
    caseItem.graph_nodes.some(n => n.isFraudRing) ||
    caseItem.status === 'resolved_fraud' ||
    (caseItem.status === 'requires_approval' && caseItem.initial_risk_score >= 0.5)
  );
}

export function getFormattedTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

/**
 * Creates the initial recommended containment or clearance actions for a case.
 */
export function getInitialCaseActions(caseItem: BenchmarkCase): CaseAction[] {
  const isFraud = isCaseFraud(caseItem);
  const cardLast4 = caseItem.card_id.slice(-4) || '9021';
  const isResolvedFraud = caseItem.status === 'resolved_fraud';
  const isResolvedCleared = caseItem.status === 'resolved_cleared';
  const isRequiresApproval = caseItem.status === 'requires_approval';

  if (isFraud) {
    return [
      {
        id: 'act_block_card',
        title: `Block Card (*${cardLast4})`,
        description: 'Permanently disable card to prevent further unauthorized charges.',
        approval_tier: 'L1',
        state: isResolvedFraud ? 'executed' : isRequiresApproval ? 'pending_approval' : 'recommended',
        decisionBy: isResolvedFraud ? DEMO_ANALYST_NAME : undefined,
        decisionAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:10 UTC') : undefined,
        decisionTier: 'L1',
        executedAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:10 UTC') : undefined,
      },
      {
        id: 'act_freeze_account',
        title: `Freeze Account (${caseItem.account_id})`,
        description: 'Restrict online access and block suspicious device fingerprint.',
        approval_tier: 'L2',
        state: isResolvedFraud ? 'executed' : isRequiresApproval ? 'pending_approval' : 'recommended',
        decisionBy: isResolvedFraud ? DEMO_ANALYST_NAME : undefined,
        decisionAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:12 UTC') : undefined,
        decisionTier: 'L2',
        executedAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:12 UTC') : undefined,
      },
      {
        id: 'act_file_sar',
        title: 'File SAR Report',
        description: 'Submit regulatory report for unauthorized transaction activity.',
        approval_tier: 'L1',
        state: isResolvedFraud ? 'executed' : isRequiresApproval ? 'pending_approval' : 'recommended',
        decisionBy: isResolvedFraud ? DEMO_ANALYST_NAME : undefined,
        decisionAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:15 UTC') : undefined,
        decisionTier: 'L1',
        executedAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:15 UTC') : undefined,
      },
      {
        id: 'act_notify_owner',
        title: 'Notify Account Owner',
        description: 'Alert cardholder of compromised credentials and reissue card.',
        approval_tier: 'auto',
        state: isResolvedFraud ? 'executed' : 'recommended',
        executedAt: isResolvedFraud ? (caseItem.timestamp.slice(11) || '18:24:18 UTC') : undefined,
      },
    ];
  }

  // Benign clearance steps
  return [
    {
      id: 'act_release_hold',
      title: 'Release Transaction Hold',
      description: `Authorize payment of $${caseItem.amount_usd.toFixed(2)} and allow settlement.`,
      approval_tier: 'auto',
      state: isResolvedCleared ? 'executed' : 'recommended',
      executedAt: isResolvedCleared ? (caseItem.timestamp.slice(11) || '18:24:10 UTC') : undefined,
    },
    {
      id: 'act_keep_active',
      title: 'Keep Account Active',
      description: 'No account restrictions required; customer status remains in good standing.',
      approval_tier: 'auto',
      state: isResolvedCleared ? 'executed' : 'recommended',
      executedAt: isResolvedCleared ? (caseItem.timestamp.slice(11) || '18:24:12 UTC') : undefined,
    },
    {
      id: 'act_clearance_record',
      title: 'Clearance Record',
      description: 'Add verified phone to trusted device profile to reduce future friction.',
      approval_tier: 'auto',
      state: isResolvedCleared ? 'executed' : 'recommended',
      executedAt: isResolvedCleared ? (caseItem.timestamp.slice(11) || '18:24:15 UTC') : undefined,
    },
  ];
}

/**
 * Initializes a BenchmarkCase with its actions and starting activity feed lines.
 */
export function initializeCaseWithActions(caseItem: BenchmarkCase): BenchmarkCase {
  const actions = caseItem.actions || getInitialCaseActions(caseItem);
  const isResolvedFraud = caseItem.status === 'resolved_fraud';
  const isResolvedCleared = caseItem.status === 'resolved_cleared';
  const isRequiresApproval = caseItem.status === 'requires_approval';

  const initialFeed: string[] = caseItem.activity_feed || [];
  if (initialFeed.length === 0) {
    const ts = caseItem.timestamp.slice(11) || '18:24:10 UTC';
    initialFeed.push(`[${ts}] [i] Case ${caseItem.case_id} initialized with risk signal ${(caseItem.initial_risk_score * 100).toFixed(0)}%`);

    if (isResolvedFraud) {
      initialFeed.push(`[${ts}] [+] Block Card approved by ${DEMO_ANALYST_NAME} (L1)`);
      initialFeed.push(`[${ts}] [+] Freeze Account approved by ${DEMO_ANALYST_NAME} (L2)`);
      initialFeed.push(`[${ts}] [+] File SAR Report approved by ${DEMO_ANALYST_NAME} (L1)`);
      initialFeed.push(`[${ts}] [✓] Case closed as Confirmed Fraud`);
    } else if (isResolvedCleared) {
      initialFeed.push(`[${ts}] [✓] Release Transaction Hold executed`);
      initialFeed.push(`[${ts}] [✓] Case resolved as Verified Legitimate`);
    } else if (isRequiresApproval) {
      initialFeed.push(`[${ts}] [!] Containment actions pending human authorization (L1/L2)`);
    }
  }

  return {
    ...caseItem,
    actions,
    activity_feed: initialFeed,
  };
}

/**
 * Transitions actions to pending_approval when an investigation completes on a case.
 */
export function prepareActionsPostInvestigation(caseItem: BenchmarkCase): {
  actions: CaseAction[];
  feedLines: string[];
  newStatus: CaseStatus;
} {
  const isFraud = isCaseFraud(caseItem);
  const time = getFormattedTimestamp();
  const currentActions = caseItem.actions || getInitialCaseActions(caseItem);

  if (isFraud) {
    const updatedActions = currentActions.map(action => {
      if (action.approval_tier === 'L1' || action.approval_tier === 'L2') {
        return {
          ...action,
          state: 'pending_approval' as const,
        };
      }
      return action;
    });

    const feedLines = [
      `[${time}] [i] Automated graph investigation completed. Pattern: ${caseItem.primary_pattern}.`,
      `[${time}] [!] Containment actions routed for human authorization: Block Card (L1), Freeze Account (L2), File SAR (L1).`,
    ];

    return {
      actions: updatedActions,
      feedLines,
      newStatus: 'requires_approval',
    };
  }

  // Benign case
  const updatedActions = currentActions.map(action => ({
    ...action,
    state: 'executed' as const,
    executedAt: time,
  }));

  const feedLines = [
    `[${time}] [i] Automated graph investigation completed. No fraudulent linkages identified.`,
    `[${time}] [✓] Benign clearance steps executed under automated policy.`,
  ];

  return {
    actions: updatedActions,
    feedLines,
    newStatus: 'resolved_cleared',
  };
}

/**
 * Evaluates whether case status can advance to resolved or closed based on action states.
 */
export function evaluateCaseStatus(
  caseItem: BenchmarkCase,
  actions: CaseAction[]
): { status: CaseStatus; denial_warning?: string } {
  const isFraud = isCaseFraud(caseItem);

  // If any required action was denied, case CANNOT be marked resolved!
  const deniedAction = actions.find(a => a.state === 'denied');
  if (deniedAction) {
    return {
      status: 'requires_approval',
      denial_warning: `Containment action "${deniedAction.title}" was denied by ${deniedAction.decisionBy || 'analyst'}. Required containment incomplete — case cannot be marked as resolved.`,
    };
  }

  // If any required L1/L2 action is still pending approval or recommended, case cannot advance to resolved!
  const hasPendingL1L2 = actions.some(
    a => (a.approval_tier === 'L1' || a.approval_tier === 'L2') &&
         (a.state === 'pending_approval' || a.state === 'recommended')
  );
  if (hasPendingL1L2) {
    return {
      status: 'requires_approval',
      denial_warning: undefined,
    };
  }

  // Check if all required L1/L2 actions have reached approved and executed
  const allRequiredApprovedAndExecuted = actions
    .filter(a => a.approval_tier === 'L1' || a.approval_tier === 'L2')
    .every(a => a.state === 'executed' && Boolean(a.decisionBy));

  if (allRequiredApprovedAndExecuted) {
    return {
      status: isFraud ? 'resolved_fraud' : 'resolved_cleared',
      denial_warning: undefined,
    };
  }

  return {
    status: caseItem.status,
    denial_warning: undefined,
  };
}
