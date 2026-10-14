import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, RotateCcw } from 'lucide-react';
import type { TreeNode } from '../types';
import { sound } from '../utils/sound';

interface Tree3DVisualizerProps {
  root: TreeNode | null;
  activeNodeIds: string[];
  evaluatedNodeValues: Record<string, number>;
  onSelectNode?: (node: TreeNode) => void;
}

interface FlattenedNode {
  node: TreeNode;
  pos: [number, number, number];
  leftPos?: [number, number, number];
  rightPos?: [number, number, number];
}

// 3D Branch Line between two 3D points
const BranchCylinder: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  isActive: boolean;
}> = ({ start, end, isActive }) => {
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const distance = p1.distanceTo(p2);
  const position = p1.clone().add(p2).multiplyScalar(0.5);

  const orientation = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = p2.clone().sub(p1).normalize();
  orientation.lookAt(p1, p2, up);

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <cylinderGeometry args={[0.07, 0.07, distance, 12]} />
      <meshStandardMaterial
        color={isActive ? '#f59e0b' : '#38bdf8'}
        emissive={isActive ? '#f59e0b' : '#0284c7'}
        emissiveIntensity={isActive ? 0.8 : 0.3}
        roughness={0.3}
        metalness={0.7}
      />
      <primitive
        object={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction
        )}
        attach="quaternion"
      />
    </mesh>
  );
};

// 3D Spherical Node with Billboard HTML label
const SphereNode: React.FC<{
  item: FlattenedNode;
  isActive: boolean;
  evaluatedValue?: number;
  onClick: () => void;
}> = ({ item, isActive, evaluatedValue, onClick }) => {
  const isOperator = item.node.type === 'operator';

  const sphereColor = isActive
    ? '#f59e0b'
    : isOperator
    ? '#6366f1'
    : '#10b981';

  const emissiveColor = isActive
    ? '#fbbf24'
    : isOperator
    ? '#4338ca'
    : '#047857';

  return (
    <group position={item.pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        scale={isActive ? 1.25 : 1.0}
      >
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={sphereColor}
          emissive={emissiveColor}
          emissiveIntensity={isActive ? 0.9 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* BillBoard Label floating in 3D */}
      <Html center distanceFactor={14} pointerEvents="none">
        <div
          className={`flex flex-col items-center justify-center font-mono font-bold select-none cursor-pointer transition-all ${
            isActive
              ? 'scale-125 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
              : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
          }`}
        >
          <span className="text-sm tracking-tight">{item.node.value}</span>
          {evaluatedValue !== undefined && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-semibold mt-0.5">
              ={evaluatedValue}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
};

export const Tree3DVisualizer: React.FC<Tree3DVisualizerProps> = ({
  root,
  activeNodeIds,
  evaluatedNodeValues,
  onSelectNode
}) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<any>(null);

  // Flatten tree into 3D coordinates
  const flattenedNodes: FlattenedNode[] = useMemo(() => {
    if (!root) return [];
    const result: FlattenedNode[] = [];

    const traverse = (node: TreeNode): [number, number, number] => {
      // Coordinate mapping: X = lateral span, Y = height downwards, Z = depth arch
      const pos: [number, number, number] = [node.x, node.y, node.z];

      let leftPos: [number, number, number] | undefined;
      let rightPos: [number, number, number] | undefined;

      if (node.left) {
        leftPos = traverse(node.left);
      }
      if (node.right) {
        rightPos = traverse(node.right);
      }

      result.push({
        node,
        pos,
        leftPos,
        rightPos
      });

      return pos;
    };

    traverse(root);
    return result;
  }, [root]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl glass-panel border border-slate-800/90 overflow-hidden flex flex-col">
      {/* 3D Visualizer Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-purple-400"></span>
          <span className="text-xs font-semibold text-slate-300">3D Spatial Universe</span>
          <span className="text-[10px] text-slate-500 font-mono">
            Orbit Camera • Left Click to Rotate • Right Click to Pan • Scroll to Zoom
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playPop(520);
              setAutoRotate(!autoRotate);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRotate
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Toggle Orbital Auto-Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Auto-Rotate</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Reset 3D Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, -1, 14], fov: 48 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 20, 15]} intensity={1.5} />
          <directionalLight position={[-10, -20, -15]} intensity={0.4} color="#38bdf8" />
          <pointLight position={[0, 0, 8]} intensity={1.2} color="#a855f7" />

          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            enableDamping
            dampingFactor={0.05}
            maxDistance={40}
            minDistance={4}
          />

          {/* Render 3D Connecting Branch Cylinders */}
          {flattenedNodes.map((item, idx) => (
            <React.Fragment key={`branch-${idx}`}>
              {item.leftPos && (
                <BranchCylinder
                  start={item.pos}
                  end={item.leftPos}
                  isActive={
                    activeNodeIds.includes(item.node.id) &&
                    activeNodeIds.includes(item.node.left?.id || '')
                  }
                />
              )}
              {item.rightPos && (
                <BranchCylinder
                  start={item.pos}
                  end={item.rightPos}
                  isActive={
                    activeNodeIds.includes(item.node.id) &&
                    activeNodeIds.includes(item.node.right?.id || '')
                  }
                />
              )}
            </React.Fragment>
          ))}

          {/* Render 3D Nodes */}
          {flattenedNodes.map((item) => (
            <SphereNode
              key={item.node.id}
              item={item}
              isActive={activeNodeIds.includes(item.node.id)}
              evaluatedValue={evaluatedNodeValues[item.node.id] ?? item.node.evaluatedValue}
              onClick={() => {
                sound.playPop(item.node.type === 'operator' ? 620 : 500);
                if (onSelectNode) onSelectNode(item.node);
              }}
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
};
