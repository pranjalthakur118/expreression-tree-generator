import React, { useRef, useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Info
} from 'lucide-react';
import type { TreeNode } from '../types';
import { sound } from '../utils/sound';

interface Tree2DVisualizerProps {
  root: TreeNode | null;
  activeNodeIds: string[];
  evaluatedNodeValues: Record<string, number>;
  onSelectNode?: (node: TreeNode) => void;
}

interface LayoutNode {
  id: string;
  value: string;
  type: 'operator' | 'operand';
  x: number;
  y: number;
  left?: LayoutNode;
  right?: LayoutNode;
  raw: TreeNode;
  evaluatedValue?: number;
}

export const Tree2DVisualizer: React.FC<Tree2DVisualizerProps> = ({
  root,
  activeNodeIds,
  evaluatedNodeValues,
  onSelectNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Compute 2D tree layout with clear spacing
  const NODE_RADIUS = 28;
  const LEVEL_SPACING = 95;

  const build2DLayout = (node: TreeNode | null | undefined): LayoutNode | null => {
    if (!node) return null;

    // Use computed subtree widths from engine
    const layoutNode: LayoutNode = {
      id: node.id,
      value: node.value,
      type: node.type,
      x: node.x * 75, // Scale from 3D coordinates
      y: (node.depth * LEVEL_SPACING),
      left: build2DLayout(node.left) || undefined,
      right: build2DLayout(node.right) || undefined,
      raw: node,
      evaluatedValue: evaluatedNodeValues[node.id] ?? node.evaluatedValue
    };

    return layoutNode;
  };

  const layoutRoot = root ? build2DLayout(root) : null;

  // Center tree on initial load or root change
  useEffect(() => {
    if (containerRef.current && layoutRoot) {
      const containerWidth = containerRef.current.clientWidth;
      setPan({ x: containerWidth / 2, y: 70 });
      setZoom(1);
    }
  }, [root]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.3), 3.0));
  };

  // Export SVG to PNG
  const exportToPNG = () => {
    if (!svgRef.current) return;
    sound.playSuccess();
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth * 2;
      canvas.height = svgElement.clientHeight * 2;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#090d16';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pngURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `expression-tree-${Date.now()}.png`;
        link.href = pngURL;
        link.click();
      }
    };
    image.src = blobURL;
  };

  // Flatten nodes and links for rendering
  const nodesList: LayoutNode[] = [];
  const linksList: { from: LayoutNode; to: LayoutNode; isLeft: boolean }[] = [];

  const traverseForRender = (current: LayoutNode | null) => {
    if (!current) return;
    nodesList.push(current);
    if (current.left) {
      linksList.push({ from: current, to: current.left, isLeft: true });
      traverseForRender(current.left);
    }
    if (current.right) {
      linksList.push({ from: current, to: current.right, isLeft: false });
      traverseForRender(current.right);
    }
  };

  if (layoutRoot) {
    traverseForRender(layoutRoot);
  }

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl glass-panel border border-slate-800/90 overflow-hidden select-none flex flex-col">
      {/* Visualizer Top Bar with Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-semibold text-slate-300">2D Structural Canvas</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {nodesList.length} Nodes • Drag to Pan • Wheel to Zoom
          </span>
        </div>

        {/* Viewport Control Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.2, 3.0))}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.8, 0.3))}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (containerRef.current) {
                setPan({ x: containerRef.current.clientWidth / 2, y: 70 });
                setZoom(1);
              }
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={exportToPNG}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
            title="Export as High-Res PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-radial-grid"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="activeLinkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Transform group for Pan & Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* 1. Branch Links */}
            {linksList.map(({ from, to }, idx) => {
              const isActive =
                activeNodeIds.includes(from.id) && activeNodeIds.includes(to.id);

              // Curved Bezier path between nodes
              const startX = from.x;
              const startY = from.y + NODE_RADIUS;
              const endX = to.x;
              const endY = to.y - NODE_RADIUS;
              const midY = (startY + endY) / 2;

              const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

              return (
                <g key={`link-${idx}`}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isActive ? '#f59e0b' : 'rgba(56, 189, 248, 0.35)'}
                    strokeWidth={isActive ? 3.5 : 2}
                    strokeDasharray={isActive ? '4 2' : undefined}
                    className={isActive ? 'animate-pulse' : 'transition-all duration-300'}
                  />
                  {/* Subtle directional branch indicator */}
                  <circle
                    cx={(startX + endX) / 2}
                    cy={midY}
                    r={2.5}
                    fill={isActive ? '#fbbf24' : '#38bdf8'}
                    opacity={0.6}
                  />
                </g>
              );
            })}

            {/* 2. Nodes */}
            {nodesList.map((node) => {
              const isActive = activeNodeIds.includes(node.id);
              const isOperator = node.type === 'operator';
              const isSelected = selectedNode?.id === node.id;
              const evalValue = evaluatedNodeValues[node.id] ?? node.evaluatedValue;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playPop(isOperator ? 650 : 540);
                    setSelectedNode(node.raw);
                    if (onSelectNode) onSelectNode(node.raw);
                  }}
                >
                  {/* Active highlight halo ring */}
                  {isActive && (
                    <circle
                      r={NODE_RADIUS + 9}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="animate-spin origin-center"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  {/* Selection indicator ring */}
                  {isSelected && (
                    <circle
                      r={NODE_RADIUS + 5}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Node Circle Background */}
                  <circle
                    r={NODE_RADIUS}
                    fill={
                      isActive
                        ? '#78350f'
                        : isOperator
                        ? '#1e1b4b'
                        : '#064e3b'
                    }
                    stroke={
                      isActive
                        ? '#fbbf24'
                        : isOperator
                        ? '#818cf8'
                        : '#34d399'
                    }
                    strokeWidth={isActive ? 3 : 2}
                    filter={isActive ? 'url(#activeGlow)' : undefined}
                    className="hover:brightness-125 transition-all"
                  />

                  {/* Node Value Label */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill={isActive ? '#fef08a' : '#ffffff'}
                    fontSize={isOperator ? '22px' : '17px'}
                    fontWeight="bold"
                    fontFamily="'JetBrains Mono', monospace"
                    className="pointer-events-none select-none"
                  >
                    {node.value}
                  </text>

                  {/* Evaluated Value Floating Badge (when evaluated) */}
                  {evalValue !== undefined && (
                    <g transform={`translate(${NODE_RADIUS - 4}, ${-NODE_RADIUS + 4})`}>
                      <rect
                        x="-14"
                        y="-10"
                        width="30"
                        height="18"
                        rx="6"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <text
                        x="1"
                        y="2"
                        textAnchor="middle"
                        fontSize="9px"
                        fontWeight="bold"
                        fill="#34d399"
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        ={evalValue}
                      </text>
                    </g>
                  )}

                  {/* Node type tag: Op / Num */}
                  <text
                    y={NODE_RADIUS + 14}
                    textAnchor="middle"
                    fontSize="9px"
                    fontWeight="600"
                    fill={isOperator ? '#a5b4fc' : '#6ee7b7'}
                    className="pointer-events-none opacity-80 uppercase tracking-widest"
                  >
                    {isOperator ? 'OP' : 'NUM'}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Subtree Inspector Float Card */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 max-w-xs p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-xl backdrop-blur-md animate-in fade-in duration-150 z-20">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Info className="w-3.5 h-3.5" />
                <span>Subtree Inspector</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Node ID:</span>
                <span className="text-slate-200">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Node Value:</span>
                <span className="font-bold text-amber-400">{selectedNode.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depth Level:</span>
                <span className="text-slate-200">{selectedNode.depth}</span>
              </div>
              {evaluatedNodeValues[selectedNode.id] !== undefined && (
                <div className="flex justify-between pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                  <span>Evaluated Value:</span>
                  <span>{evaluatedNodeValues[selectedNode.id]}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
