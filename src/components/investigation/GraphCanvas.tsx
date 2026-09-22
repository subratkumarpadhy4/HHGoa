import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  Layers, 
  Eye, 
  AlertOctagon, 
  X, 
  Smartphone, 
  CreditCard, 
  User, 
  Globe, 
  FolderArchive, 
  Move
} from 'lucide-react';
import type { GraphNode, GraphEdge } from '../../types/investigation';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  caseId: string;
  isInvestigating?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes: initialNodes,
  edges,
  caseId,
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showEdgeLabels, setShowEdgeLabels] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync when case changes
  useEffect(() => {
    setNodes(initialNodes);
    setSelectedNode(null);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  }, [caseId, initialNodes]);

  // Filter nodes based on entity type
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return nodes;
    return nodes.filter(n => n.type.toLowerCase() === activeFilter.toLowerCase());
  }, [nodes, activeFilter]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Filter edges based on visible nodes
  const visibleEdges = useMemo(() => {
    return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  // Identify nodes in fraud ring
  const fraudRingNodes = useMemo(() => {
    return nodes.filter(n => n.isFraudRing);
  }, [nodes]);

  // Node Drag handling
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const currentY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      setNodes(prev => prev.map(n => {
        if (n.id === draggingNodeId) {
          return { ...n, x: Math.round(currentX), y: Math.round(currentY) };
        }
        return n;
      }));
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsDraggingCanvas(false);
  };

  // Node styling helper matching Image 3
  const getNodeVisuals = (node: GraphNode) => {
    const isSelected = selectedNode?.id === node.id;
    const fill = '#FFFFFF';
    let stroke = '#64748B';
    let icon = <Layers className="w-3.5 h-3.5" />;

    switch (node.type) {
      case 'Transaction':
        stroke = '#E11D48';
        icon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
        break;
      case 'Account':
        stroke = '#0284C7';
        icon = <User className="w-3.5 h-3.5 text-sky-600" />;
        break;
      case 'Card':
        stroke = '#7C3AED';
        icon = <CreditCard className="w-3.5 h-3.5 text-purple-600" />;
        break;
      case 'Device':
        stroke = '#16A34A';
        icon = <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
        break;
      case 'IP':
        stroke = '#D97706';
        icon = <Globe className="w-3.5 h-3.5 text-amber-600" />;
        break;
      case 'PriorCase':
        stroke = '#E11D48';
        icon = <FolderArchive className="w-3.5 h-3.5 text-rose-600" />;
        break;
    }

    return { fill, stroke, icon, isSelected };
  };

  return (
    <div className="relative flex-1 h-full min-h-[360px] bg-slate-50/70 overflow-hidden flex flex-col select-none">
      {/* Top Floating Graph Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Entity Filter Badges */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-1 rounded-lg text-xs">
          <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter:</span>
          </span>
          {['all', 'transaction', 'device', 'account', 'card', 'ip', 'priorcase'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'all' ? 'All Entities' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Canvas Controls: Zoom, Reset, Labels */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-1 rounded-lg text-xs">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2))}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.5))}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
            title="Reset Pan & Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={() => setShowEdgeLabels(!showEdgeLabels)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 ${
              showEdgeLabels ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Labels</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex-1 w-full h-full relative cursor-${isDraggingCanvas ? 'grabbing' : 'grab'}`}
      >
        <svg 
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            {/* Coordinated Ring Cluster Bounding Aura matching Image 3 */}
            {fraudRingNodes.length > 0 && (
              <g className="pointer-events-none">
                <ellipse
                  cx={600}
                  cy={185}
                  rx={195}
                  ry={140}
                  className="fill-rose-500/[0.02] stroke-rose-400 stroke-dashed animate-ring-pulse"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={600}
                  y={46}
                  textAnchor="middle"
                  className="fill-rose-600 font-extrabold text-[10.5px] tracking-widest uppercase font-mono"
                >
                  COORDINATED RING CLUSTER
                </text>
              </g>
            )}

            {/* Edge Lines */}
            {visibleEdges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.x || 400;
              const y1 = sourceNode.y || 200;
              const x2 = targetNode.x || 400;
              const y2 = targetNode.y || 200;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id} className="transition-opacity duration-300">
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={edge.isSuspicious ? '#E11D48' : '#94A3B8'}
                    strokeWidth={edge.isSuspicious ? '1.8' : '1.2'}
                    strokeDasharray={edge.isSuspicious ? '4 3' : 'none'}
                    className={edge.isSuspicious ? 'animate-dash' : ''}
                  />
                  {showEdgeLabels && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-40"
                        y="-9"
                        width="80"
                        height="18"
                        rx="4"
                        fill="#FFFFFF"
                        stroke={edge.isSuspicious ? '#FECDD3' : '#E2E8F0'}
                        strokeWidth="1"
                        className="shadow-xs"
                      />
                      <text
                        textAnchor="middle"
                        y="3.5"
                        className={`text-[8.5px] font-mono font-bold ${
                          edge.isSuspicious ? 'fill-rose-600' : 'fill-slate-600'
                        }`}
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes matching Image 3 geometry */}
            {filteredNodes.map((node) => {
              const { fill, stroke, isSelected } = getNodeVisuals(node);
              const nx = node.x || 400;
              const ny = node.y || 200;
              const lines = node.label.split('\n');

              return (
                <g
                  key={node.id}
                  transform={`translate(${nx}, ${ny})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selection Glow */}
                  {isSelected && (
                    <rect
                      x="-74"
                      y="-37"
                      width="148"
                      height="74"
                      rx="12"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Red Dashed Outline for Fraud Entities matching Image 3 */}
                  {node.isFraudRing && (
                    <rect
                      x="-71"
                      y="-34"
                      width="142"
                      height="68"
                      rx="10"
                      fill="none"
                      stroke="#E11D48"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Node Capsule Card */}
                  <rect
                    x="-65"
                    y="-28"
                    width="130"
                    height="56"
                    rx="8"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? '2' : '1.8'}
                    className="shadow-xs transition-transform duration-100 group-hover:scale-[1.02]"
                  />

                  {/* Node Header Badge with Entity Type */}
                  <rect
                    x="-58"
                    y="-24"
                    width="116"
                    height="15"
                    rx="3"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="-13"
                    textAnchor="middle"
                    className="font-mono text-[8.5px] font-bold fill-slate-700 tracking-wider uppercase"
                  >
                    {node.type}
                  </text>

                  {/* Node Text Content: Line 1 Name */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    className="font-mono text-[9.5px] font-bold fill-slate-900"
                  >
                    {lines[0]}
                  </text>

                  {/* Line 2 Subtitle / Value */}
                  {lines[1] && (
                    <text
                      x="0"
                      y="17"
                      textAnchor="middle"
                      className="font-mono text-[8.5px] font-semibold fill-slate-500"
                    >
                      {lines[1]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Node Detail Slide-in Card (Inspector) */}
        {selectedNode && (
          <div className="absolute right-3 bottom-3 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-popup p-3.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-slate-100 border border-slate-200">
                  {getNodeVisuals(selectedNode).icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    {selectedNode.id}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Entity: {selectedNode.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Properties List */}
            <div className="space-y-1.5 text-[11px]">
              {selectedNode.isFraudRing && (
                <div className="p-1.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[10px] flex items-center space-x-1">
                  <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>Flagged in Coordinated Ring Cluster</span>
                </div>
              )}

              {Object.entries(selectedNode.properties).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-0.5 border-b border-slate-50 text-[10.5px]">
                  <span className="text-slate-500 font-medium capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-mono font-semibold text-slate-800">{String(value)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">TigerGraph Savanna Node</span>
              <span className="text-indigo-600 font-medium">1-Hop Traversed</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-700 uppercase">Topology Subgraph:</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
            <span>Transaction</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Device</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Card</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Account</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>IP Address</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Prior Case (Memory)</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400">
          <Move className="w-3 h-3" />
          <span>Click & Drag to reposition nodes or pan</span>
        </div>
      </div>
    </div>
  );
};
