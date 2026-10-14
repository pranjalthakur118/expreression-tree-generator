import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  BarChart3, 
  Binary, 
  Scale
} from 'lucide-react';
import type { TreeStats } from '../types';
import { sound } from '../utils/sound';

interface ExpressionInspectorProps {
  stats: TreeStats | null;
  result: number | null;
}

export const ExpressionInspector: React.FC<ExpressionInspectorProps> = ({
  stats,
  result
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!stats) return null;

  const copyText = (key: string, text: string) => {
    sound.playPop(500);
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Final Computed Result Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluated Value
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Final Answer
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              {result !== null ? result : '—'}
            </span>
          </div>
        </div>

        <button
          onClick={() => copyText('result', String(result))}
          className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
        >
          {copiedKey === 'result' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Result Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Result</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Traversal Formats: Infix, Postfix, Prefix */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Tree Traversals</span>
          </div>
          <span className="text-[10px] text-slate-500">Notations</span>
        </div>

        {/* Infix */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Infix Notation (Parenthesized)</span>
            <button
              onClick={() => copyText('infix', stats.infix)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              title="Copy Infix"
            >
              {copiedKey === 'infix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-850 font-mono text-xs text-slate-200 truncate">
            {stats.infix}
          </div>
        </div>

        {/* Postfix (RPN) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-cyan-400">Postfix / RPN (Left, Right, Root)</span>
            <button
              onClick={() => copyText('postfix', stats.postfix)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              title="Copy Postfix"
            >
              {copiedKey === 'postfix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-850 font-mono text-xs text-cyan-300 truncate">
            {stats.postfix}
          </div>
        </div>

        {/* Prefix */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-purple-400">Prefix / Polish (Root, Left, Right)</span>
            <button
              onClick={() => copyText('prefix', stats.prefix)}
              className="text-slate-400 hover:text-purple-400 transition-colors"
              title="Copy Prefix"
            >
              {copiedKey === 'prefix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-850 font-mono text-xs text-purple-300 truncate">
            {stats.prefix}
          </div>
        </div>
      </div>

      {/* 3. Structural Properties & Metrics */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Tree Metrics</span>
          </div>
          <span className="text-[10px] text-slate-500">Topology</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-400">Tree Height</span>
            <span className="text-xl font-bold font-mono text-white mt-1">{stats.height}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-400">Total Nodes</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1">{stats.totalNodes}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-400">Operators (Internal)</span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1">{stats.operatorNodes}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-400">Operands (Leaves)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.leafNodes}</span>
          </div>
        </div>

        {/* Balanced Status Badge */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span>Height Balanced:</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            stats.isBalanced
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {stats.isBalanced ? 'Balanced' : 'Unbalanced'}
          </span>
        </div>
      </div>
    </div>
  );
};
