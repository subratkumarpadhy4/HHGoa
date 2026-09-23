"""
request_evidence.py
-------------------
Node 5: Requests additional evidence or customer confirmation when evidence is insufficient.
"""

from datetime import datetime
from agent.state import AgentState


def request_evidence_node(state: AgentState) -> AgentState:
    """Simulate requesting additional evidence from customer or analyst."""
    req = {
        "type": "customer_validation",
        "asked_after_step": state["evidence_rounds"],
        "assumed_response": "Mock: customer did not make this purchase.",
    }
    state["evidence_requests"].append(req)

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    state["trace"].append({
        "node": "request_evidence",
        "timestamp": now_str,
        "details": f"Requested customer validation at round {state['evidence_rounds']}.",
    })

    return state
