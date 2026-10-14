import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Trash2, 
  ArrowUpRight, 
  Search, 
  BookmarkCheck
} from 'lucide-react';
import type { SavedExpression } from '../types';
import { sound } from '../utils/sound';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedExpressions: SavedExpression[];
  onSelect: (expr: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedExpressions,
  onSelect,
  onToggleFavorite,
  onDelete
}) => {
  const [filterFav, setFilterFav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = savedExpressions.filter((item) => {
    if (filterFav && !item.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.expression.toLowerCase().includes(q) || (item.notes && item.notes.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-[#0d121f] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Saved Expressions</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {savedExpressions.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPop(400);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved expressions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterFav(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                !filterFav
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({savedExpressions.length})
            </button>
            <button
              onClick={() => setFilterFav(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterFav
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Favorites ({savedExpressions.filter(s => s.isFavorite).length})</span>
            </button>
          </div>
        </div>

        {/* Expressions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No saved expressions found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 font-mono text-sm font-bold text-slate-100 break-all">
                    {item.expression}
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="text-slate-500 hover:text-amber-400 p-1"
                    title={item.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-emerald-400 font-semibold">
                    Result: {item.result}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playPop(550);
                        onSelect(item.expression);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-colors"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        sound.playPop(300);
                        onDelete(item.id);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    {item.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
