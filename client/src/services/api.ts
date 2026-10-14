import type { ParseResult, SavedExpression, PresetItem } from '../types';
import { parseExpressionLocally } from './treeEngine';

const API_BASE_URL = 'http://localhost:5000/api';

const DEFAULT_PRESETS: PresetItem[] = [
  {
    label: 'Basic Precedence',
    expression: '3 + 4 * 2',
    description: 'Multiplication binds tighter than addition'
  },
  {
    label: 'Parenthesized Subtrees',
    expression: '(3 + 5) * (10 - 4)',
    description: 'Parentheses override default operator precedence'
  },
  {
    label: 'Exponentiation & Powers',
    expression: '2 ^ 3 + 4 * 5',
    description: 'Right-associative power operator evaluation'
  },
  {
    label: 'Nested Calculations',
    expression: '((12 / 3) + 7) * (8 - 2 ^ 2)',
    description: 'Multi-level nested tree with powers and division'
  },
  {
    label: 'Modulo & Mixed Ops',
    expression: '(45 % 7) * (18 / 3) + 2 ^ 4',
    description: 'Combined modulo, division, and exponentiation'
  },
  {
    label: 'Deep Symmetrical Tree',
    expression: '((8 + 2) * (5 - 3)) / (2 ^ 2 + 1)',
    description: 'Full binary tree with balanced symmetrical branches'
  },
  {
    label: 'Decimal & Unary Minus',
    expression: '-5.5 + 3.2 * 4 - (10 / -2)',
    description: 'Negative numbers and floating-point math'
  }
];

export async function parseExpression(expression: string): Promise<ParseResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/tree/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[API] Backend unreachable or timeout. Using high-performance client engine fallback.', err);
  }

  // Graceful client-side fallback
  return parseExpressionLocally(expression);
}

export async function fetchPresets(): Promise<PresetItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/expressions/presets`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.presets) {
        return data.presets;
      }
    }
  } catch {}
  return DEFAULT_PRESETS;
}

const STORAGE_KEY = 'expression_tree_saved_items';

function getLocalStoredExpressions(): SavedExpression[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'local-1',
      userId: 'guest',
      expression: '(3 + 5) * (10 - 4)',
      result: 48,
      isFavorite: true,
      notes: 'Classic nested arithmetic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'local-2',
      userId: 'guest',
      expression: '2 ^ 3 + 4 * 5',
      result: 28,
      isFavorite: true,
      notes: 'Exponentiation example',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function saveLocalStoredExpressions(list: SavedExpression[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchHistory(): Promise<SavedExpression[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/expressions`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {}
  return getLocalStoredExpressions();
}

export async function saveExpression(
  expression: string,
  result: number,
  notes: string = '',
  isFavorite: boolean = false
): Promise<SavedExpression> {
  try {
    const res = await fetch(`${API_BASE_URL}/expressions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, result, notes, isFavorite })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {}

  // Local fallback
  const items = getLocalStoredExpressions();
  const newItem: SavedExpression = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: 'guest',
    expression,
    result,
    notes,
    isFavorite,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.unshift(newItem);
  saveLocalStoredExpressions(items);
  return newItem;
}

export async function toggleFavorite(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/expressions/${id}/favorite`, { method: 'PATCH' });
    if (res.ok) {
      return true;
    }
  } catch {}

  const items = getLocalStoredExpressions();
  const target = items.find(e => e.id === id);
  if (target) {
    target.isFavorite = !target.isFavorite;
    target.updatedAt = new Date().toISOString();
    saveLocalStoredExpressions(items);
    return true;
  }
  return false;
}

export async function deleteExpression(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/expressions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch {}

  const items = getLocalStoredExpressions();
  const filtered = items.filter(e => e.id !== id);
  saveLocalStoredExpressions(filtered);
  return true;
}
