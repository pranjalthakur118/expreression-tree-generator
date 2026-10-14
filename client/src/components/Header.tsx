import React, { useState } from 'react';
import { 
  GitFork, 
  Box, 
  Volume2, 
  VolumeX, 
  BookmarkCheck, 
  HelpCircle, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  onOpenHistory: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenHistory,
  savedCount
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [showHelp, setShowHelp] = useState(false);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playPop(600);
    }
  };

  return (
    <>
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                <GitFork className="w-5 h-5 text-cyan-400 rotate-180" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Expression Tree <span className="text-cyan-400 font-extrabold">Studio</span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Interactive Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Binary AST Generation • Spatial 3D Canopy • Step-by-Step Post-Order Trace
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher: 2D vs 3D */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <button
                onClick={() => {
                  sound.playPop(520);
                  setViewMode('2d');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '2d'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Vector</span>
              </button>
              <button
                onClick={() => {
                  sound.playPop(580);
                  setViewMode('3d');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Spatial</span>
              </button>
            </div>

            {/* Saved Expressions Drawer Toggle */}
            <button
              onClick={() => {
                sound.playPop(480);
                onOpenHistory();
              }}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Saved Expressions & History"
            >
              <BookmarkCheck className="w-4 h-4 text-cyan-400" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-slate-900/80 text-cyan-400 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Help / Guide */}
            <button
              onClick={() => {
                sound.playPop(550);
                setShowHelp(true);
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Precedence & Grammar Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 border border-slate-700 shadow-2xl">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Expression Tree & Operator Precedence</h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p>
                An <strong className="text-cyan-300">Expression Tree</strong> is a binary tree where internal nodes correspond to mathematical operators and leaves correspond to numeric operands.
              </p>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Operator Precedence & Associativity
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 text-slate-200 border-b border-slate-800/80 font-mono text-[11px]">
                  <span className="font-semibold text-purple-400">^ (Power)</span>
                  <span>Precedence 3</span>
                  <span className="text-amber-400">Right to Left</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 text-slate-200 border-b border-slate-800/80 font-mono text-[11px]">
                  <span className="font-semibold text-cyan-400">* / %</span>
                  <span>Precedence 2</span>
                  <span>Left to Right</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 text-slate-200 font-mono text-[11px]">
                  <span className="font-semibold text-emerald-400">+ -</span>
                  <span>Precedence 1</span>
                  <span>Left to Right</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-white">Supported Features:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Parenthesized grouping <code className="text-cyan-300 font-mono">( ... )</code> for overriding precedence.</li>
                  <li>Floating-point decimal numbers (e.g. <code className="text-cyan-300 font-mono">3.14</code>, <code className="text-cyan-300 font-mono">0.5</code>).</li>
                  <li>Unary minus on negative numbers (e.g. <code className="text-cyan-300 font-mono">-5 + 3</code>, <code className="text-cyan-300 font-mono">10 * -2</code>).</li>
                  <li>Interactive step player detailing runtime stack snapshots during post-order traversal.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-semibold text-slate-950 transition-colors text-xs"
            >
              Got it, let's build!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
