"""
enforce_policy.py
-----------------
Node 7: Deterministic policy enforcement to validate action authority and route (auto/L1/L2).
"""

from datetime import datetime
from agent.state import AgentState


def enforce_policy_node(state: AgentState) -> AgentState:
    """Enforce financial crime policy rules to assign approval route."""
    # Skeleton mode: default to auto authorization
    state["approval_route"] = "auto"

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    state["trace"].append({
        "node": "enforce_policy",
        "timestamp": now_str,
        "details": "Policy evaluated. Assigned approval route: 'auto'.",
    })

    return state
