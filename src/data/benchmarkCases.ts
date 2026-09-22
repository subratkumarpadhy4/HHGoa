import type { BenchmarkCase, GraphNode } from '../types/investigation';

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    case_id: 'CASE-01',
    case_number: 1,
    transaction_id: 'TXN-3049102',
    account_id: 'ACC-89104',
    card_id: 'CARD-4111-XXXX-9021',
    amount_usd: 894.20,
    timestamp: '18:24:10 UTC',
    initial_risk_score: 0.88,
    status: 'under_investigation',
    primary_pattern: 'SharedDeviceRing',
    pre_evidence_uncertainty: 'MEDIUM',
    post_evidence_uncertainty: 'HIGH',
    pre_evidence_nba: {
      action: 'Temporary 30-Minute Hold',
      action_id: 'ACT-HOLD-30M',
      approval_tier: 'auto',
      approval_route: 'Automated Rule #12',
      rationale: 'Initial anomaly 88% with multi-account device ring cluster. Hold initiated pending step-up authentication.',
      alternatives_considered: ['Immediate Card Block', 'Allow with Monitoring'],
      simulated_api: 'core_banking_engine.place_temporary_hold(duration_min=30)'
    },
    evidence_injected: {
      request_type: 'request_step_up_auth',
      label: 'Step-up Authentication (SMS OTP)',
      status: 'FAILED',
      timestamp: '18:26:10 UTC',
      response_payload: {
        method: 'SMS_OTP',
        destination: '+1 (555) ***-9021',
        result: 'FAILED — no response within 3 attempts',
        seconds_elapsed: 180
      }
    },
    post_evidence_nba: {
      action: 'Block Card & Freeze Account',
      action_id: 'ACT-BLOCK-FREEZE-SAR',
      approval_tier: 'L2',
      approval_route: 'Requires Senior Analyst Sign-off',
      rationale: 'Failed step-up auth with confirmed device ring linkage. Sufficiency score 2.8 / 2.5 SUFFICIENT.',
      alternatives_considered: ['Extend Hold 24h', 'Secondary Phone Contact'],
      simulated_api: 'risk_management.execute_containment_and_sar()'
    },
    uncertainty_dimensions: {
      fraud_risk_signal: 3,
      graph_evidence: 3,
      behavioral_evidence: 2,
      policy_support: 3,
      contradictory_evidence: 0,
      calculated_score: 2.8,
      threshold: 2.5,
      status: 'SUFFICIENT'
    },
    evidence_pack: {
      trigger: {
        type: 'risk_score',
        risk_signal: 0.88,
        source: 'IEEE-CIS XGBoost Real-Time Detector',
        timestamp: '18:24:10 UTC'
      },
      transaction_context: {
        transaction_id: 'TXN-3049102',
        amount_usd: 894.20,
        card_bin: '411111 (Visa Consumer)',
        product_cd: 'W (Online Electronic Retail)',
        p_emaildomain: 'protonmail.com',
        device_info: 'iOS 17.4 / Safari Mobile',
        ip_address: '198.51.100.44',
        geo_location: 'San Jose, CA',
        c_features_summary: 'C1=7, C2=14 (Burst activity)',
        v_features_summary: 'V201=1, V202=894.20'
      },
      connected_entities: [
        { type: 'Device', id: 'DEV-F089-B2C1', linkage: 'Shared across 7 customer profiles', historical_fraud: true },
        { type: 'Card', id: 'CARD-4111-XXXX-9021', linkage: 'Target credential', historical_fraud: false },
        { type: 'Account', id: 'ACC-89104', linkage: 'Subject account', historical_fraud: false },
        { type: 'IP', id: '198.51.100.44', linkage: 'Datacenter egress proxy', historical_fraud: true },
        { type: 'PriorCase', id: '#0741', linkage: 'Confirmed device ring fraud (Loss $4.2k)', historical_fraud: true }
      ],
      detected_patterns: [
        {
          pattern: 'SharedDeviceRing',
          strength: 'strong',
          observations: [
            '7 distinct customer accounts on device DEV-F089-B2C1',
            '14 transactions in 48-hour window',
            '3 associated accounts previously closed for fraud'
          ]
        }
      ],
      prior_cases: {
        note: 'Contextual support only',
        related: [
          { case_id: '#0741', shared_entity: 'DEV-F089-B2C1', outcome: 'Confirmed Fraud ($4.2k Loss)' }
        ],
        similar: []
      },
      policy_rules: [
        {
          rule_id: 'R7',
          title: 'Shared-Device Fraud Rings',
          text: 'Where three or more accounts share a device fingerprint within a rolling 7-day window and any linked account has a prior confirmed fraud outcome, the case is treated as directive evidence of a coordinated ring.',
          source: 'Fraud Operations Standard §4.2'
        },
        {
          rule_id: 'R12',
          title: 'Step-Up Authentication Failure',
          text: 'A failed or non-responsive step-up challenge on a flagged transaction removes behavioral ambiguity and authorizes escalation to account-level action.',
          source: 'Risk Containment Policy §2.1'
        },
        {
          rule_id: 'R21',
          title: 'SAR Filing Threshold',
          text: 'Confirmed device-ring fraud exceeding the reporting threshold requires a Suspicious Activity Report within the regulatory filing window.',
          source: 'FinCEN BSA 31 CFR § 1020.320'
        }
      ],
      missing_evidence: [],
      contradictions: []
    },
    graph_nodes: [
      { id: 'ACC-89104', label: 'Account\n#89104', type: 'Account', properties: { created: '3d ago', kyc: 'Tier 1' }, x: 130, y: 150 },
      { id: 'CARD-9021', label: 'Visa Card\n*9021', type: 'Card', properties: { brand: 'Visa', bin: '411111' }, x: 120, y: 280 },
      { id: 'TXN-3049102', label: 'TXN #3049102\n$894.20', type: 'Transaction', riskScore: 0.88, isFraudRing: true, properties: { amount: '$894.20', status: 'Pending Hold', time: '18:24:10 UTC' }, x: 365, y: 215 },
      { id: 'CASE-0741', label: 'Prior Case\n#0741 (Loss $4.2k)', type: 'PriorCase', isFraudRing: true, properties: { outcome: 'Fraud Confirmed', loss: '$4,200' }, x: 440, y: 80 },
      { id: 'DEV-F089', label: 'Device Ring Core\nDEV-F089-B2C1', type: 'Device', isFraudRing: true, properties: { model: 'iPhone 15', os: 'iOS 17.4', accounts_seen: 7 }, x: 605, y: 175 },
      { id: 'IP-198', label: 'IP Address\n198.51.100.44', type: 'IP', isFraudRing: true, properties: { vpn: true, isp: 'Datacenter' }, x: 550, y: 310 },
      { id: 'ACC-77102', label: 'Linked Acc\n#77102', type: 'Account', isFraudRing: true, properties: { status: 'Closed Fraud' }, x: 835, y: 120 },
      { id: 'ACC-65489', label: 'Linked Acc\n#65489', type: 'Account', isFraudRing: true, properties: { status: 'Chargeback' }, x: 845, y: 245 }
    ],
    graph_edges: [
      { id: 'e1', source: 'ACC-89104', target: 'TXN-3049102', label: 'INITIATED', type: 'OWNS' },
      { id: 'e2', source: 'CARD-9021', target: 'TXN-3049102', label: 'PAYMENT_VIA', type: 'USES_CARD' },
      { id: 'e3', source: 'TXN-3049102', target: 'DEV-F089', label: 'EXECUTED', type: 'ON_DEVICE', isSuspicious: true },
      { id: 'e4', source: 'TXN-3049102', target: 'IP-198', label: 'ROUTED_THROUGH', type: 'FROM_IP', isSuspicious: true },
      { id: 'e5', source: 'IP-198', target: 'DEV-F089', label: 'ORIGIN_PAIR', type: 'LINKED_TO' },
      { id: 'e6', source: 'CASE-0741', target: 'DEV-F089', label: 'PRIOR_SUBJECT', type: 'LINKED_TO', isSuspicious: true },
      { id: 'e7', source: 'DEV-F089', target: 'ACC-77102', label: 'SHARED_HARDWARE', type: 'LINKED_TO', isSuspicious: true },
      { id: 'e8', source: 'DEV-F089', target: 'ACC-65489', label: 'SHARED_HARDWARE', type: 'LINKED_TO', isSuspicious: true }
    ],
    execution_steps: [
      {
        id: 1,
        title: 'Trigger & Signal Ingestion',
        subtitle: 'Model risk score compared against rolling baseline',
        status: 'complete',
        timestamp: '18:24:10.104',
        details: 'Model anomaly 88% flagged for account ACC-89104. Velocity & device deviation triggered case opening.',
        mcpCall: { tool: 'webhook_listener', latencyMs: 14, summary: 'Score 0.88 on TXN-3049102' }
      },
      {
        id: 2,
        title: 'Graph Traversal & Topology Extraction',
        subtitle: 'TigerGraph MCP get_transaction_context() executed',
        status: 'complete',
        timestamp: '18:24:10.820',
        details: 'Discovered device DEV-F089-B2C1 shared across 7 distinct accounts. Prior case #0741 linked ($4.2k loss).',
        mcpCall: { tool: 'tigergraph_mcp.find_connected_entities', latencyMs: 48, summary: 'Discovered shared device DEV-F089-B2C1 with 7 accounts' }
      },
      {
        id: 3,
        title: 'Pre-Evidence Uncertainty Evaluation',
        subtitle: 'Graph evidence strong; behavioral intent unconfirmed',
        status: 'complete',
        timestamp: '18:24:11.205',
        details: 'Uncertainty level MEDIUM. Missing active customer intent corroboration. NBA: Temporary 30-Minute Hold.',
        outputSnippet: 'Sufficiency: INSUFFICIENT (Score 1.8 < 2.5). Dispatched request_step_up_auth.'
      },
      {
        id: 4,
        title: 'Dynamic Evidence Gathering',
        subtitle: 'Step-up authentication requested from account owner',
        status: 'complete',
        timestamp: '18:27:11.450',
        details: 'Step-up challenge dispatched via SMS OTP to +1 (555) ***-9021. Result: FAILED — no response within 3 attempts (180s timeout).',
        outputSnippet: 'Mock API Response: { status: "FAILED", result: "TIMEOUT_NO_RESPONSE", attempts: 3 }'
      },
      {
        id: 5,
        title: 'Post-Evidence Re-evaluation & Confidence Recalibration',
        subtitle: 'Sufficiency moves to SUFFICIENT (2.8)',
        status: 'complete',
        timestamp: '18:27:12.110',
        details: 'Failure of step-up auth corroborates coordinated ring activity. Recalibrated NBA to Block Card & Freeze Account. Routed to L2 Sign-off.',
        outputSnippet: 'Status: SUFFICIENT (2.8 >= 2.5). Action: Block Card & Freeze Account (L2).'
      }
    ],
    sar_report: {
      sar_id: 'SAR-2026-US-091482',
      filing_date: '2026-09-22',
      subject_name: 'ACC-89104 (Linked: DEV-F089-B2C1)',
      subject_account: 'ACC-89104',
      transaction_amount: 894.20,
      activity_start: '2026-09-18',
      activity_end: '2026-09-22',
      primary_violation: 'Shared-Device Fraud Ring / Coordinated Bust-Out',
      regulatory_basis: 'FinCEN BSA 31 CFR § 1020.320 / R21',
      compliance_analyst: 'Automated Agent Sentinel / L2 Compliance Sign-off',
      narrative: `SUSPICIOUS ACTIVITY REPORT — DRAFT (auto-generated, requires analyst review)

Case: CASE-01  |  Subject Transaction: TXN-3049102  |  Filed: 18:24:10 UTC

Subject Account: ACC-89104 (Card CARD-4111-XXXX-9021)
Amount: USD 894.20

Summary of Activity:
The subject transaction (TXN-3049102, USD 894.20) was flagged by the fraud detection model with an initial risk score of 0.88. Graph analysis via TigerGraph identified the transaction pattern "SharedDeviceRing". The originating device DEV-F089-B2C1 was found shared across multiple accounts within a seven-day window, one of which is linked to a previously confirmed fraud case (#0741).

Evidence Considered:
- Graph topology: device, IP, and account linkage (see Panel 1 — Investigation Graph)
- Step-up authentication: failed, no customer response within three attempts
- Prior case memory: matched entity linkage to closed fraud investigation #0741

Action Taken:
Block Card & Freeze Account, routed for Requires Senior Analyst Sign-off (L2).

Regulatory Basis:
R7 — Shared-Device Fraud Rings; R12 — Step-Up Authentication Failure; R21 — SAR Filing Threshold.

Prepared by: Sentra Agentic Investigation Platform
Status: Pending analyst countersignature before regulatory submission.`
    }
  },
  {
    case_id: 'CASE-02',
    case_number: 2,
    transaction_id: 'TXN-772015',
    account_id: 'USR-90144',
    card_id: '•••• 9013',
    amount_usd: 118.20,
    timestamp: '2026-09-22 14:02 UTC',
    initial_risk_score: 0.58,
    status: 'under_investigation',
    primary_pattern: 'Benign Velocity Spike',
    pre_evidence_uncertainty: 'MEDIUM',
    post_evidence_uncertainty: 'LOW',
    pre_evidence_nba: {
      action: 'Temporary 30-Minute Hold',
      action_id: 'ACT-HOLD-30M',
      approval_tier: 'auto',
      approval_route: 'Automated Rule #12',
      rationale: 'Transaction velocity is 3.5x normal baseline. Pre-emptive hold initiated pending step-up confirmation.',
      alternatives_considered: ['Decline', 'Pass without review']
    },
    evidence_injected: {
      request_type: 'request_customer_validation',
      label: 'Step-up Authentication (SMS OTP)',
      status: 'PASSED',
      timestamp: '2026-09-22 14:02:45 UTC',
      response_payload: {
        method: 'SMS_OTP',
        result: 'PASSED — confirmed from known device',
        duration_seconds: 14
      }
    },
    post_evidence_nba: {
      action: 'Clear & Resume Monitoring',
      action_id: 'ACT-CLEAR',
      approval_tier: 'auto',
      approval_route: 'Automated Rule #4',
      rationale: 'Cardholder confirmed purchase within 14 seconds via known device DVC-11A0. Cleared as false positive velocity spike.',
      alternatives_considered: ['Extend Hold']
    },
    uncertainty_dimensions: {
      fraud_risk_signal: 2,
      graph_evidence: 0,
      behavioral_evidence: 2,
      policy_support: 1,
      contradictory_evidence: 3,
      calculated_score: 0.4,
      threshold: 2.5,
      status: 'CONTRADICTORY'
    },
    evidence_pack: {
      trigger: {
        type: 'risk_score',
        risk_signal: 0.58,
        source: 'IEEE-CIS Velocity Monitor',
        timestamp: '2026-09-22 14:02 UTC'
      },
      transaction_context: {
        transaction_id: 'TXN-772015',
        amount_usd: 118.20,
        card_bin: '542418 (Mastercard)',
        product_cd: 'Card-Not-Present',
        p_emaildomain: 'gmail.com',
        device_info: 'iOS 17.5 / Mobile Banking App',
        ip_address: '88.14.x.x',
        geo_location: 'Austin, TX',
        c_features_summary: 'C1=4 (Burst in 15m)',
        v_features_summary: 'V100=4, V101=118.20'
      },
      connected_entities: [
        { type: 'Device', id: 'DVC-11A0', linkage: 'Known trusted customer device (480 days)', historical_fraud: false },
        { type: 'Account', id: 'USR-90144', linkage: 'Customer profile with clean history', historical_fraud: false },
        { type: 'IP', id: '88.14.x.x', linkage: 'Residential broadband ISP', historical_fraud: false }
      ],
      detected_patterns: [
        {
          pattern: 'VelocityBurst',
          strength: 'moderate',
          observations: ['4 consecutive transactions within 15 minutes']
        }
      ],
      prior_cases: {
        note: 'Contextual support only',
        related: [],
        similar: []
      },
      policy_rules: [
        {
          rule_id: 'R4',
          title: 'Velocity-Only Signals',
          text: 'A velocity deviation with no corroborating graph or device evidence is advisory only and does not by itself authorize account-level action.',
          source: 'Card Risk Guidelines §3.1'
        },
        {
          rule_id: 'R9',
          title: 'Successful Step-Up Resolution',
          text: 'A passed step-up challenge from a previously known device resolves ordinary velocity anomalies without escalation.',
          source: 'Cardholder Authentication Standard §1.4'
        }
      ],
      missing_evidence: [],
      contradictions: ['Customer passed authentication immediately from trusted hardware']
    },
    graph_nodes: [
      { id: 'USR-90144', label: 'Account\nUSR-90144', type: 'Account', properties: { status: 'Good Standing' }, x: 180, y: 160 },
      { id: 'CARD-9013', label: 'Mastercard\n•••• 9013', type: 'Card', properties: { brand: 'Mastercard' }, x: 180, y: 290 },
      { id: 'TXN-772015', label: 'TXN #772015\n$118.20', type: 'Transaction', riskScore: 0.58, properties: { amount: '$118.20', status: 'Cleared' }, x: 440, y: 225 },
      { id: 'DVC-11A0', label: 'Device\nDVC-11A0 (known)', type: 'Device', properties: { model: 'iPhone 14', trusted_days: 480 }, x: 700, y: 160 },
      { id: 'IP-88-14', label: 'IP Address\n88.14.x.x (home)', type: 'IP', properties: { isp: 'Residential Fiber' }, x: 700, y: 290 }
    ],
    graph_edges: [
      { id: 'e1', source: 'USR-90144', target: 'TXN-772015', label: 'OWNS', type: 'OWNS' },
      { id: 'e2', source: 'TXN-772015', target: 'CARD-9013', label: 'PAYMENT_VIA', type: 'USES_CARD' },
      { id: 'e3', source: 'TXN-772015', target: 'DVC-11A0', label: 'AUTHENTICATED_ON', type: 'ON_DEVICE' },
      { id: 'e4', source: 'TXN-772015', target: 'IP-88-14', label: 'HOME_NETWORK', type: 'FROM_IP' }
    ],
    execution_steps: [
      { id: 1, title: 'Trigger & Signal Ingestion', subtitle: 'Velocity burst crosses threshold', status: 'complete', details: 'Transaction burst flagged. Risk score: 0.58.' },
      { id: 2, title: 'Graph Traversal & Topology Extraction', subtitle: 'Verified single known device & IP', status: 'complete', details: 'Zero shared devices or prior fraud linkage detected in TigerGraph.' },
      { id: 3, title: 'Pre-Evidence Uncertainty Evaluation', subtitle: 'Uncertainty MEDIUM — precautionary step-up', status: 'complete', details: 'Precautionary hold initiated pending confirmation.' },
      { id: 4, title: 'Dynamic Evidence Gathering', subtitle: 'Customer step-up authentication PASSED', status: 'complete', details: 'Cardholder validated identity via OTP within 14 seconds.' },
      { id: 5, title: 'Post-Evidence Re-evaluation', subtitle: 'Case resolved as legitimate false positive', status: 'complete', details: 'Confirmed legitimate velocity spike. Resumed standard monitoring.' }
    ]
  },
  {
    case_id: 'CASE-03',
    case_number: 3,
    transaction_id: 'TXN-773390',
    account_id: 'USR-73302',
    card_id: '•••• 3390',
    amount_usd: 2.14,
    timestamp: '2026-09-23 01:47 UTC',
    initial_risk_score: 0.97,
    status: 'requires_approval',
    primary_pattern: 'Direct Fraud Pattern',
    pre_evidence_uncertainty: 'HIGH',
    post_evidence_uncertainty: 'HIGH',
    pre_evidence_nba: {
      action: 'Block Card & Freeze Account',
      action_id: 'ACT-BLOCK-FREEZE-SAR',
      approval_tier: 'L2',
      approval_route: 'Requires Senior Analyst Sign-off',
      rationale: 'Micro-charge probe $2.14 against known blacklisted device DVC-F002 and IP 203.0.x.x. Directive policy match.',
      alternatives_considered: ['Decline only']
    },
    evidence_injected: {
      request_type: 'request_device_fingerprint',
      label: 'None requested — hard override',
      status: 'FAILED',
      timestamp: '2026-09-23 01:47:05 UTC',
      response_payload: {
        reason: 'Hard-override condition met: directive policy + high graph evidence. No additional evidence needed.'
      }
    },
    post_evidence_nba: {
      action: 'Block Card & Freeze Account (confirmed)',
      action_id: 'ACT-BLOCK-FREEZE-SAR-CONF',
      approval_tier: 'L2',
      approval_route: 'Requires Senior Analyst Sign-off',
      rationale: 'Card testing pattern confirmed against two prior fraud cases. Directive policy R2 commands immediate account freeze.',
      alternatives_considered: ['None (High Severity Attack)']
    },
    uncertainty_dimensions: {
      fraud_risk_signal: 3,
      graph_evidence: 3,
      behavioral_evidence: 2,
      policy_support: 3,
      contradictory_evidence: 0,
      calculated_score: 3.0,
      threshold: 2.5,
      status: 'SUFFICIENT'
    },
    evidence_pack: {
      trigger: {
        type: 'risk_score',
        risk_signal: 0.97,
        source: 'IEEE-CIS Bot Detector',
        timestamp: '2026-09-23 01:47 UTC'
      },
      transaction_context: {
        transaction_id: 'TXN-773390',
        amount_usd: 2.14,
        card_bin: '400000 (Visa Classic)',
        product_cd: 'Card-Testing / CNP',
        p_emaildomain: 'temp-mail.org',
        device_info: 'HeadlessChrome / Linux',
        ip_address: '203.0.x.x',
        geo_location: 'Proxy / Tor Node',
        c_features_summary: 'C1=18 (Rapid enumeration probes)',
        v_features_summary: 'V310=2.14'
      },
      connected_entities: [
        { type: 'Device', id: 'DVC-F002', linkage: 'Headless bot fingerprint', historical_fraud: true },
        { type: 'IP', id: '203.0.x.x', linkage: 'Blacklisted proxy node', historical_fraud: true },
        { type: 'Card', id: '•••• 3390', linkage: 'Target credential', historical_fraud: false }
      ],
      detected_patterns: [
        {
          pattern: 'CardTesting',
          strength: 'strong',
          observations: ['18 failed micro-authorizations under $3 in 60s', 'Headless browser automation script']
        }
      ],
      prior_cases: {
        note: 'Contextual support only',
        related: [],
        similar: [
          { case_id: 'CASE-0119', relevance_score: 0.98, matching_dimensions: ['CardTesting', 'Tor'], outcome: 'Confirmed BIN Attack', analyst_decision: 'Block' }
        ]
      },
      policy_rules: [
        {
          rule_id: 'R2',
          title: 'Card Testing Typology',
          text: 'Rapid low-value authorizations against a device or IP previously linked to confirmed fraud are treated as directive evidence under the Card Testing typology.',
          source: 'Card Security Directive §1.1'
        },
        {
          rule_id: 'R21',
          title: 'SAR Filing Threshold',
          text: 'Confirmed device-ring fraud exceeding the reporting threshold requires a Suspicious Activity Report within the regulatory filing window.',
          source: 'FinCEN BSA 31 CFR § 1020.320'
        }
      ],
      missing_evidence: [],
      contradictions: []
    },
    graph_nodes: [
      { id: 'CARD-3390', label: 'Card\n•••• 3390', type: 'Card', properties: { bin: '400000', attempts: 18 }, x: 180, y: 220 },
      { id: 'TXN-773390', label: 'TXN #773390\n$2.14', type: 'Transaction', riskScore: 0.97, isFraudRing: true, properties: { amount: '$2.14', status: 'Blocked' }, x: 420, y: 220 },
      { id: 'DVC-F002', label: 'Device\nDVC-F002 (flagged)', type: 'Device', isFraudRing: true, properties: { model: 'HeadlessChrome', headless: true }, x: 670, y: 150 },
      { id: 'IP-203-0', label: 'IP Address\n203.0.x.x (blacklisted)', type: 'IP', isFraudRing: true, properties: { proxy: true }, x: 670, y: 290 },
      { id: 'PATTERN-CT', label: 'Pattern\nCardTesting', type: 'PriorCase', isFraudRing: true, properties: { matched: 'Directive' }, x: 860, y: 150 }
    ],
    graph_edges: [
      { id: 'e1', source: 'TXN-773390', target: 'CARD-3390', label: 'PAYMENT_VIA', type: 'USES_CARD' },
      { id: 'e2', source: 'TXN-773390', target: 'DVC-F002', label: 'EXECUTED_ON', type: 'ON_DEVICE', isSuspicious: true },
      { id: 'e3', source: 'TXN-773390', target: 'IP-203-0', label: 'ROUTED_THROUGH', type: 'FROM_IP', isSuspicious: true },
      { id: 'e4', source: 'DVC-F002', target: 'PATTERN-CT', label: 'MATCHES', type: 'LINKED_TO', isSuspicious: true }
    ],
    execution_steps: [
      { id: 1, title: 'Trigger & Signal Ingestion', subtitle: 'High risk score on ingestion (0.97)', status: 'complete', details: 'Micro-charge probe of $2.14 flagged. Model risk score 0.97.' },
      { id: 2, title: 'Graph Traversal & Topology Extraction', subtitle: 'detect_pattern() matches CardTesting', status: 'complete', details: 'Device DVC-F002 and IP 203.0.x.x linked to two closed fraud cases.' },
      { id: 3, title: 'Pre-Evidence Uncertainty Evaluation', subtitle: 'Hard-override condition met', status: 'complete', details: 'Directive policy + strong graph evidence satisfies hard override for immediate sufficiency.' },
      { id: 4, title: 'Dynamic Evidence Gathering', subtitle: 'No additional evidence requested', status: 'complete', details: 'Sufficiency engine hard override short-circuits the uncertainty loop.' },
      { id: 5, title: 'Post-Evidence Re-evaluation', subtitle: 'Case proceeds directly to NBA', status: 'complete', details: 'High confidence state confirmed. Block Card & Freeze Account authorized.' }
    ],
    sar_report: {
      sar_id: 'SAR-2026-US-091499',
      filing_date: '2026-09-23',
      subject_name: 'Unknown Bot Operator (DVC-F002)',
      subject_account: 'USR-73302',
      transaction_amount: 2.14,
      activity_start: '2026-09-23',
      activity_end: '2026-09-23',
      primary_violation: 'Automated Card Testing / Bot Enumeration',
      regulatory_basis: 'FinCEN BSA 31 CFR § 1020.320 / R2',
      compliance_analyst: 'Automated Agent Sentinel / L2 Reviewer',
      narrative: `SUSPICIOUS ACTIVITY REPORT — DRAFT (auto-generated, requires analyst review)

Case: CASE-03  |  Subject Transaction: TXN-773390  |  Filed: 2026-09-23 01:47 UTC

Subject Account: USR-73302 (Card •••• 3390)
Amount: USD 2.14

Summary of Activity:
The subject transaction (TXN-773390, USD 2.14) was flagged by the fraud detection model with an initial risk score of 0.97. Graph analysis via TigerGraph identified the transaction pattern "CardTesting". The originating device and IP address were both linked to two previously confirmed fraud cases involving the same typology.

Evidence Considered:
- Graph topology: device, IP, and account linkage (see Panel 1 — Investigation Graph)
- Documented typology match: CardTesting (directive policy support)
- Prior case memory: matched entity linkage to closed fraud investigations

Action Taken:
Block Card & Freeze Account, routed for Requires Senior Analyst Sign-off (L2).

Regulatory Basis:
R2 — Card Testing Typology; R21 — SAR Filing Threshold.

Prepared by: Sentra Agentic Investigation Platform
Status: Pending analyst countersignature before regulatory submission.`
    }
  },
  ...generateRemainingBenchmarkCases()
];

function generateRemainingBenchmarkCases(): BenchmarkCase[] {
  const typologies = [
    { pattern: 'EmailDomainCluster', name: 'Disposable Domain Syndicate', risk: 0.81, amount: 640.00, status: 'requires_approval' as const },
    { pattern: 'GeoMismatch', name: 'Impossible Velocity Travel Mismatch', risk: 0.77, amount: 1250.00, status: 'under_investigation' as const },
    { pattern: 'AmountAnomaly', name: 'High-Value Outlier Surge', risk: 0.85, amount: 4890.00, status: 'requires_approval' as const },
    { pattern: 'SharedDeviceRing', name: 'Emulated Device ID Farm', risk: 0.91, amount: 720.00, status: 'resolved_fraud' as const },
    { pattern: 'VelocityBurst', name: 'Rapid Re-order Sequence', risk: 0.45, amount: 110.00, status: 'resolved_cleared' as const },
    { pattern: 'CardTesting', name: 'Batch Pre-auth Micro-charges', risk: 0.93, amount: 0.99, status: 'resolved_fraud' as const },
    { pattern: 'EmailDomainCluster', name: 'Temporary Mailbox Spurt', risk: 0.69, amount: 340.00, status: 'under_investigation' as const },
    { pattern: 'GeoMismatch', name: 'Cross-Continent IP vs Billing Jump', risk: 0.83, amount: 1890.00, status: 'requires_approval' as const },
    { pattern: 'SharedDeviceRing', name: 'Multi-identity Mobile Nexus', risk: 0.87, amount: 940.00, status: 'resolved_fraud' as const },
    { pattern: 'VelocityBurst', name: 'Legitimate Salary Payday Surge', risk: 0.38, amount: 450.00, status: 'resolved_cleared' as const },
    { pattern: 'AmountAnomaly', name: 'Luxury Goods Sudden Purchase', risk: 0.79, amount: 3200.00, status: 'under_investigation' as const },
    { pattern: 'CardTesting', name: 'Algorithmic Expiry Date Probe', risk: 0.92, amount: 2.10, status: 'resolved_fraud' as const },
    { pattern: 'SharedDeviceRing', name: 'Mule Ring Reselling Electronics', risk: 0.89, amount: 1450.00, status: 'requires_approval' as const },
    { pattern: 'EmailDomainCluster', name: 'Coordinated Mailbox Generator', risk: 0.74, amount: 510.00, status: 'under_investigation' as const },
    { pattern: 'GeoMismatch', name: 'Simultaneous Physical POS & Web Txn', risk: 0.86, amount: 980.00, status: 'resolved_fraud' as const },
    { pattern: 'VelocityBurst', name: 'Authorized Corporate Purchasing', risk: 0.41, amount: 2300.00, status: 'resolved_cleared' as const },
    { pattern: 'AmountAnomaly', name: 'First-time International Wire Draft', risk: 0.82, amount: 5600.00, status: 'requires_approval' as const }
  ];

  return typologies.map((t, idx) => {
    const caseNum = idx + 4;
    const caseId = `CASE-${caseNum < 10 ? '0' + caseNum : caseNum}`;
    const txnId = `TXN-77${1000 + caseNum * 37}`;
    const accId = `USR-${8800 + caseNum * 13}`;
    const cardId = `•••• ${4000 + caseNum * 77}`.slice(-9);
    const isFraud = t.status === 'resolved_fraud' || t.status === 'requires_approval';

    return {
      case_id: caseId,
      case_number: caseNum,
      transaction_id: txnId,
      account_id: accId,
      card_id: cardId,
      amount_usd: t.amount,
      timestamp: `2026-09-${(10 + caseNum % 18).toString().padStart(2, '0')} ${(1 + caseNum % 22).toString().padStart(2, '0')}:${(caseNum * 7 % 60).toString().padStart(2, '0')} UTC`,
      initial_risk_score: t.risk,
      status: t.status,
      primary_pattern: t.name,
      pre_evidence_uncertainty: isFraud ? 'MEDIUM' : 'HIGH',
      post_evidence_uncertainty: isFraud ? 'LOW' : 'LOW',
      pre_evidence_nba: {
        action: isFraud ? 'Temporary 30-Minute Hold' : 'Temporary 30-Minute Hold',
        action_id: `ACT-PRE-${caseNum}`,
        approval_tier: 'auto',
        approval_route: isFraud ? 'Automated Rule #12' : 'Automated Rule #12',
        rationale: `Pattern ${t.pattern} flagged. Pre-emptive hold initiated pending verification.`,
        alternatives_considered: ['Decline', 'Pass']
      },
      evidence_injected: {
        request_type: isFraud ? 'request_step_up_auth' : 'request_customer_validation',
        label: 'Step-up Authentication (SMS OTP)',
        status: isFraud ? 'FAILED' : 'PASSED',
        timestamp: `2026-09-22 18:26 UTC`,
        response_payload: isFraud ? { result: 'FAILED — timeout / no response' } : { result: 'PASSED — confirmed from known device' }
      },
      post_evidence_nba: {
        action: isFraud ? 'Block Card & Freeze Account' : 'Clear & Resume Monitoring',
        action_id: `ACT-POST-${caseNum}`,
        approval_tier: isFraud ? 'L2' : 'auto',
        approval_route: isFraud ? 'Requires Senior Analyst Sign-off' : 'Automated Rule #4',
        rationale: isFraud ? `Confirmed pattern ${t.pattern} with failed secondary verification.` : 'Customer confirmed valid transaction intent.',
        alternatives_considered: ['Extended Hold']
      },
      uncertainty_dimensions: {
        fraud_risk_signal: t.risk > 0.8 ? 3 : 2,
        graph_evidence: isFraud ? 2 : 1,
        behavioral_evidence: 2,
        policy_support: isFraud ? 3 : 1,
        contradictory_evidence: isFraud ? 0 : 3,
        calculated_score: isFraud ? 2.7 : 0.6,
        threshold: 2.5,
        status: isFraud ? 'SUFFICIENT' : 'CONTRADICTORY'
      },
      evidence_pack: {
        trigger: {
          type: 'risk_score',
          risk_signal: t.risk,
          source: 'IEEE-CIS Pipeline',
          timestamp: `2026-09-22 14:00:${caseNum} UTC`
        },
        transaction_context: {
          transaction_id: txnId,
          amount_usd: t.amount,
          card_bin: '411111',
          product_cd: 'Card-Not-Present',
          p_emaildomain: 'domain-mail.com',
          device_info: 'Chrome / Windows 11',
          ip_address: `198.51.100.${caseNum * 7 % 250}`,
          geo_location: 'New York, NY',
          c_features_summary: `C1=${caseNum}`,
          v_features_summary: `V200=1`
        },
        connected_entities: [
          { type: 'Account', id: accId, linkage: 'Customer Account Node', historical_fraud: isFraud },
          { type: 'Card', id: cardId, linkage: 'Active payment token', historical_fraud: false },
          { type: 'Device', id: `DVC-${caseNum}`, linkage: 'Primary transaction device', historical_fraud: isFraud }
        ],
        detected_patterns: [
          {
            pattern: t.pattern as any,
            strength: isFraud ? 'strong' : 'weak',
            observations: [`Detected signature for ${t.name}`, `Anomaly score ${t.risk}`]
          }
        ],
        prior_cases: {
          note: 'Contextual support only',
          related: [],
          similar: []
        },
        policy_rules: [
          {
            rule_id: 'R7',
            title: 'Shared-Device Fraud Rings',
            text: 'Where three or more accounts share a device fingerprint within a rolling 7-day window and any linked account has a prior confirmed fraud outcome, the case is treated as directive evidence of a coordinated ring.',
            source: 'Institutional Policy v5'
          }
        ],
        missing_evidence: [],
        contradictions: isFraud ? [] : ['Cardholder confirmed intent']
      },
      graph_nodes: [
        { id: txnId, label: `TXN #${txnId}\n$${t.amount.toFixed(2)}`, type: 'Transaction' as const, riskScore: t.risk, isFraudRing: isFraud, properties: { amount: `$${t.amount.toFixed(2)}` }, x: 380, y: 220 },
        { id: accId, label: `Account\n${accId}`, type: 'Account' as const, properties: { status: 'Active' }, x: 230, y: 170 },
        { id: cardId, label: `Card\n${cardId}`, type: 'Card' as const, properties: { brand: 'Visa' }, x: 220, y: 290 },
        { id: `DVC-${caseNum}`, label: `Device\n#${caseNum}`, type: 'Device' as const, isFraudRing: isFraud, properties: { model: 'Browser' }, x: 530, y: 180 },
        { id: `IP-${caseNum}`, label: `IP Address\n198.51.100.${caseNum}`, type: 'IP' as const, isFraudRing: isFraud, properties: { risk: isFraud ? 'High' : 'Low' }, x: 530, y: 300 }
      ] as GraphNode[],
      graph_edges: [
        { id: `e1-${caseNum}`, source: accId, target: txnId, label: 'OWNS', type: 'OWNS' },
        { id: `e2-${caseNum}`, source: txnId, target: cardId, label: 'PAYMENT_VIA', type: 'USES_CARD' },
        { id: `e3-${caseNum}`, source: txnId, target: `DVC-${caseNum}`, label: 'ON_DEVICE', type: 'ON_DEVICE', isSuspicious: isFraud },
        { id: `e4-${caseNum}`, source: txnId, target: `IP-${caseNum}`, label: 'FROM_IP', type: 'FROM_IP', isSuspicious: isFraud }
      ],
      execution_steps: [
        { id: 1, title: 'Trigger & Signal Ingestion', subtitle: `Ingested risk score ${t.risk}`, status: 'complete', details: `Anomaly detected on ${txnId}` },
        { id: 2, title: 'Graph Traversal & Topology Extraction', subtitle: 'Executed TigerGraph query', status: 'complete', details: `Discovered connected topology for ${accId}` },
        { id: 3, title: 'Pre-Evidence Uncertainty Evaluation', subtitle: 'Evaluated sufficiency gate', status: 'complete', details: `State: ${isFraud ? 'MEDIUM' : 'HIGH'} uncertainty` },
        { id: 4, title: 'Dynamic Evidence Gathering', subtitle: 'Evidence response received', status: 'complete', details: isFraud ? 'Step-up auth failed / timed out' : 'Customer confirmed intent' },
        { id: 5, title: 'Post-Evidence Re-evaluation', subtitle: 'Recalibrated NBA', status: 'complete', details: isFraud ? 'Sufficiency verified: Block & SAR' : 'Closed as false positive' }
      ],
      sar_report: isFraud ? {
        sar_id: `SAR-2026-US-0915${caseNum}`,
        filing_date: '2026-09-22',
        subject_name: `Identified Suspicious Cluster ${t.name}`,
        subject_account: accId,
        transaction_amount: t.amount,
        activity_start: '2026-09-20',
        activity_end: '2026-09-22',
        primary_violation: `Suspected ${t.pattern} violation`,
        regulatory_basis: 'FinCEN BSA 31 CFR § 1020.320 / R21',
        compliance_analyst: 'Automated Agent Sentinel v5.2',
        narrative: `Coordinated activity exhibiting ${t.pattern} identified across multiple transaction sessions in the amount of $${t.amount.toFixed(2)}. Evidence confirmed via TigerGraph topology traversal and step-up auth failure.`
      } : undefined
    };
  });
}
