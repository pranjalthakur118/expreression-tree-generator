import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Layers, 
  Activity,
  ArrowRight
} from 'lucide-react';
import type { EvalStep } from '../types';
import { sound } from '../utils/sound';

interface StepEvaluationPlayerProps {
  steps: EvalStep[];
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  onStepChange?: (step: EvalStep | null) => void;
}

export const StepEvaluationPlayer: React.FC<StepEvaluationPlayerProps> = ({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 0.5, 1, 2, 3

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || null;

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalMs = 1200 / speed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            sound.playSuccess();
            return prev;
          }
          const next = prev + 1;
          sound.playStep(next);
          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, totalSteps, setCurrentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      const next = currentStepIndex + 1;
      sound.playStep(next);
      setCurrentStepIndex(next);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      sound.playPop(420);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    sound.playPop(380);
    setCurrentStepIndex(0);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex >= totalSteps - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  const progressPercent = totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 100;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Player Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            Step-by-Step Post-Order Evaluation Trace
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          <span className="text-amber-400 font-bold">({Math.round(progressPercent)}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Control Buttons & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play Animation</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 px-1 text-[10px]">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Explanation & Live Memory Stack */}
      {currentStep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
          {/* Step Explanation Card */}
          <div className="lg:col-span-2 rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                currentStep.type === 'operator'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/25'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
              }`}>
                {currentStep.type === 'operator' ? 'Operator Computation' : 'Operand Push'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Target Node: <strong className="text-cyan-400">{currentStep.nodeId}</strong>
              </span>
            </div>

            <div className="text-sm font-mono text-slate-100 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentStep.description}</span>
            </div>

            {currentStep.type === 'operator' && currentStep.operation && (
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300">
                <span>Formula:</span>
                <span className="text-slate-100">
                  {currentStep.leftVal} {currentStep.operation} {currentStep.rightVal}
                </span>
                <span className="text-slate-400">=</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {currentStep.resultVal}
                </span>
              </div>
            )}
          </div>

          {/* Live Runtime Operand Stack */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runtime Stack</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentStep.stackState.length} items
              </span>
            </div>

            <div className="flex items-end gap-1.5 min-h-[50px] overflow-x-auto py-1">
              {currentStep.stackState.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">Stack empty</span>
              ) : (
                currentStep.stackState.map((stk, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center px-2 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-sm min-w-10 animate-in zoom-in-90 duration-150"
                  >
                    <span className="font-bold text-white text-xs">{stk.val}</span>
                    <span className="text-[9px] text-cyan-400/80 font-sans">
                      {idx === currentStep.stackState.length - 1 ? 'TOP' : `#${idx}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
