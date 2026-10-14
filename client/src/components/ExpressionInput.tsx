import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Bookmark, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  Delete
} from 'lucide-react';
import type { PresetItem } from '../types';
import { sound } from '../utils/sound';

interface ExpressionInputProps {
  expression: string;
  setExpression: (val: string) => void;
  onEvaluate: () => void;
  onSave: () => void;
  isSaved: boolean;
  presets: PresetItem[];
  isLoading: boolean;
  error: string | null;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
  expression,
  setExpression,
  onEvaluate,
  onSave,
  isSaved,
  presets,
  isLoading,
  error
}) => {
  const [showKeypad, setShowKeypad] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEvaluate();
    }
  };

  const handlePresetClick = (presetExpr: string) => {
    sound.playPop(520);
    setExpression(presetExpr);
  };

  const handleKeypadAppend = (char: string) => {
    sound.playPop(480);
    setExpression(expression + char);
  };

  const handleKeypadBackspace = () => {
    sound.playPop(420);
    setExpression(expression.slice(0, -1));
  };

  const handleKeypadClear = () => {
    sound.playPop(350);
    setExpression('');
  };

  return (
    <div className="w-full space-y-3">
      {/* Main Formula Input Card */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Glowing Input Box */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
              <span className="font-mono text-sm font-semibold text-slate-500">f(x) =</span>
            </div>

            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. (3 + 5) * (10 - 4) or 2 ^ 3 + 4 * 5"
              className="w-full pl-14 pr-10 py-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-slate-100 placeholder-slate-500 font-mono text-sm sm:text-base focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />

            {/* Clear button inside input */}
            {expression.length > 0 && (
              <button
                onClick={() => {
                  sound.playPop(400);
                  setExpression('');
                }}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear expression"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* On-screen Math Keypad Toggle */}
            <button
              onClick={() => {
                sound.playPop(500);
                setShowKeypad(!showKeypad);
              }}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                showKeypad
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Toggle Math Keypad"
            >
              <Calculator className="w-5 h-5" />
            </button>

            {/* Save Expression */}
            <button
              onClick={() => {
                sound.playPop(620);
                onSave();
              }}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title={isSaved ? 'Expression Saved' : 'Save to History'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Evaluate Button */}
            <button
              onClick={onEvaluate}
              disabled={isLoading || !expression.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isLoading ? 'Computing...' : 'Generate Tree'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Syntax / Error Status */}
        {error ? (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : expression.trim() ? (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Valid arithmetic format • Ready to generate tree</span>
          </div>
        ) : null}

        {/* On-screen Math Keypad Drawer */}
        {showKeypad && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-xs font-mono">
              {['7', '8', '9', '(', ')', '^', '4', '5', '6', '*', '/', '%', '1', '2', '3', '+', '-', '.'].map((char) => (
                <button
                  key={char}
                  onClick={() => handleKeypadAppend(char)}
                  className="py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/30 active:scale-95 transition-all text-center font-semibold"
                >
                  {char}
                </button>
              ))}
              <button
                onClick={() => handleKeypadAppend('0')}
                className="py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 active:scale-95 font-semibold"
              >
                0
              </button>
              <button
                onClick={handleKeypadBackspace}
                className="py-2 rounded-lg bg-slate-900/90 hover:bg-rose-950/40 text-rose-400 border border-slate-800 hover:border-rose-500/30 active:scale-95 flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                onClick={handleKeypadClear}
                className="py-2 rounded-lg bg-slate-900/90 hover:bg-rose-950/40 text-rose-400 border border-slate-800 hover:border-rose-500/30 active:scale-95 font-bold"
                title="Clear All"
              >
                AC
              </button>
              <button
                onClick={() => {
                  onEvaluate();
                }}
                className="col-span-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 active:scale-95 font-bold"
              >
                = EVAL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Expressions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[11px] font-medium pr-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Presets:</span>
        </div>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset.expression)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/30 transition-all font-mono text-[11px] flex items-center gap-1.5"
            title={preset.description}
          >
            <span className="text-slate-500 font-sans text-[10px]">{preset.label}:</span>
            <span>{preset.expression}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
