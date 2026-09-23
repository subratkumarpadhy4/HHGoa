"""
assess_sufficiency.py
---------------------
Node 4: Deterministic evaluation of whether collected evidence is sufficient to make a decision.
"""

from datetime import datetime
from agent.state import AgentState


def assess_sufficiency_node(state: AgentState) -> AgentState:
    """Assess whether current evidence is sufficient for action recommendation."""
    # 1. Increment round counter first
    current_round = state.get("evidence_rounds", 0) + 1
    state["evidence_rounds"] = current_round

    # 2. Evaluate sufficiency (round 1 -> insufficient, round >= 2 -> sufficient; hard cap >= 3)
    if current_round >= 2:
        sufficiency = "sufficient"
    else:
        sufficiency = "insufficient"

    state["sufficiency"] = sufficiency

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    state["trace"].append({
        "node": "assess_sufficiency",
        "timestamp": now_str,
        "details": f"Sufficiency evaluated as '{sufficiency}' (round {current_round}).",
    })

    return state
