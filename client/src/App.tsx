import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ExpressionInput } from './components/ExpressionInput';
import { Tree2DVisualizer } from './components/Tree2DVisualizer';
import { Tree3DVisualizer } from './components/Tree3DVisualizer';
import { StepEvaluationPlayer } from './components/StepEvaluationPlayer';
import { ExpressionInspector } from './components/ExpressionInspector';
import { HistoryDrawer } from './components/HistoryDrawer';
import { 
  parseExpression, 
  fetchPresets, 
  fetchHistory, 
  saveExpression, 
  toggleFavorite, 
  deleteExpression 
} from './services/api';
import type { ParseResult, PresetItem, SavedExpression } from './types';
import { sound } from './utils/sound';

export function App() {
  const [expression, setExpression] = useState<string>('(3 + 5) * (10 - 4)');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [savedExpressions, setSavedExpressions] = useState<SavedExpression[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load presets & history on mount
  useEffect(() => {
    fetchPresets().then(setPresets).catch(() => {});
    fetchHistory().then(setSavedExpressions).catch(() => {});
  }, []);

  // Run initial evaluation
  useEffect(() => {
    handleEvaluate(expression);
  }, []);

  const handleEvaluate = async (exprToRun = expression) => {
    if (!exprToRun.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseExpression(exprToRun);
      setParseResult(result);
      setCurrentStepIndex(0);
      sound.playSuccess();

      // Confetti burst on successful parse & evaluation
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b']
      });
    } catch (err: any) {
      setError(err.message || 'Syntax error in arithmetic expression.');
      sound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parseResult) return;
    try {
      const newSaved = await saveExpression(
        expression,
        parseResult.evaluation.result,
        'Saved from studio generator',
        false
      );
      setSavedExpressions((prev) => [newSaved, ...prev.filter(p => p.id !== newSaved.id)]);
      sound.playSuccess();
    } catch {}
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    const updated = await fetchHistory();
    setSavedExpressions(updated);
  };

  const handleDeleteSaved = async (id: string) => {
    await deleteExpression(id);
    const updated = await fetchHistory();
    setSavedExpressions(updated);
  };

  // Derive active nodes and evaluated values based on current step
  const activeStep = parseResult?.evaluation.steps[currentStepIndex] || null;
  const activeNodeIds = activeStep ? activeStep.activeNodeIds : [];

  const evaluatedNodeValues = useMemo(() => {
    const map: Record<string, number> = {};
    if (!parseResult) return map;

    const steps = parseResult.evaluation.steps;
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const s = steps[i];
      map[s.nodeId] = s.resultVal;
    }
    return map;
  }, [parseResult, currentStepIndex]);

  const isCurrentExpressionSaved = useMemo(() => {
    return savedExpressions.some((s) => s.expression.trim() === expression.trim());
  }, [savedExpressions, expression]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Navigation Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedExpressions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Expression Input & Presets */}
        <ExpressionInput
          expression={expression}
          setExpression={setExpression}
          onEvaluate={() => handleEvaluate(expression)}
          onSave={handleSave}
          isSaved={isCurrentExpressionSaved}
          presets={presets}
          isLoading={isLoading}
          error={error}
        />

        {/* Tree Visualizer Viewport (2D or 3D) */}
        {parseResult && (
          <div className="space-y-6">
            {viewMode === '2d' ? (
              <Tree2DVisualizer
                root={parseResult.root}
                activeNodeIds={activeNodeIds}
                evaluatedNodeValues={evaluatedNodeValues}
              />
            ) : (
              <Tree3DVisualizer
                root={parseResult.root}
                activeNodeIds={activeNodeIds}
                evaluatedNodeValues={evaluatedNodeValues}
              />
            )}

            {/* Step-by-Step Evaluation Trace Player */}
            <StepEvaluationPlayer
              steps={parseResult.evaluation.steps}
              currentStepIndex={currentStepIndex}
              setCurrentStepIndex={setCurrentStepIndex}
            />

            {/* Infix, Postfix, Prefix Traversals and Structural Metrics */}
            <ExpressionInspector
              stats={parseResult.stats}
              result={parseResult.evaluation.result}
            />
          </div>
        )}
      </main>

      {/* Saved Expressions Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedExpressions={savedExpressions}
        onSelect={(expr) => {
          setExpression(expr);
          handleEvaluate(expr);
        }}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteSaved}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        Expression Tree Studio • Interactive Binary Expression Tree Visualizer & Educational Traversal Engine
      </footer>
    </div>
  );
}

export default App;
