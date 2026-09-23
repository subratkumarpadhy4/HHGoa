# HHGoa - Fraud Investigation System (Monorepo)

A hybrid AI-powered fraud investigation system integrating graph neural networks, TigerGraph knowledge graph memory, Model Context Protocol (MCP), and interactive React analytics.

## Project Structure

```
HHGoa/
├── frontend/          # React + Vite + TypeScript interactive fraud workbench
├── mcp_server/        # TigerGraph MCP Server & custom fraud investigation tools
├── scripts/           # Graph loaders, count verification, and dataset utilities
├── schema/            # TigerGraph GSQL graph schema definition
├── .env.example       # Environment template
├── mcp_config.json    # MCP Server configuration
├── requirements.txt   # Python backend dependencies
└── README.md
```

## Quick Start

### 1. Backend Setup
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 2. TigerGraph Loading
```powershell
python scripts/load_minimal.py
python scripts/verify_counts.py
```

### 3. MCP Server
```powershell
python -m mcp_server.run_server
```

### 4. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
