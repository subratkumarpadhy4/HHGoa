"""
write_back.py
-------------
Node 9: Writes investigation findings, evidence vertices, and resolved case records back to the graph.
"""

from datetime import datetime
from agent.mcp_client import MCPClient
from agent.state import AgentState


def write_back_node(state: AgentState, mcp: MCPClient = None) -> AgentState:
    """Persist case decisions and evidence back to TigerGraph knowledge graph (skeleton mode)."""
    # Skeleton mode: status remains open, no graph write
    state["final_case_status"] = "open"

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    state["trace"].append({
        "node": "write_back",
        "timestamp": now_str,
        "details": "MOCK MODE — no graph write performed. Case status marked 'open'.",
    })

    return state
