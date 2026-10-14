import express, { Request, Response } from 'express';
import cors from 'cors';
import { tokenize, infixToPostfix, buildTreeFromPostfix, compute3DTreeLayout, computeTreeStats } from './tree/parser.js';
import { evaluateTree } from './tree/evaluator.js';
import { ParseResult, SavedExpression } from './types.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory store for expressions
let savedExpressions: SavedExpression[] = [
  {
    id: 'sample-1',
    userId: 'default-user',
    expression: '(3 + 5) * (10 - 4)',
    result: 48,
    isFavorite: true,
    notes: 'Classic nested arithmetic showcasing precedence',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'sample-2',
    userId: 'default-user',
    expression: '2 ^ 3 + 4 * 5',
    result: 28,
    isFavorite: true,
    notes: 'Demonstrates right-associative exponentiation higher than multiplication',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'sample-3',
    userId: 'default-user',
    expression: '((12 / 3) + 7) * (8 - 2 ^ 2)',
    result: 44,
    isFavorite: false,
    notes: 'Multi-level nested tree with powers and division',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString()
  }
];

// Curated preset examples for instant exploration
const PRESET_EXPRESSIONS = [
  {
    label: 'Basic Precedence',
    expression: '3 + 4 * 2',
    description: 'Shows multiplication binding tighter than addition'
  },
  {
    label: 'Parenthesized Subtrees',
    expression: '(3 + 5) * (10 - 4)',
    description: 'Parentheses override default operator precedence'
  },
  {
    label: 'Exponentiation & Roots',
    expression: '2 ^ 3 ^ 2',
    description: 'Right-associative power operator (2^(3^2) = 512)'
  },
  {
    label: 'Modulo & Division',
    expression: '(45 % 7) * (18 / 3) + 2 ^ 4',
    description: 'Combined modulo, division, and exponentiation'
  },
  {
    label: 'Deeply Nested Canopy',
    expression: '((8 + 2) * (5 - 3)) / (2 ^ 2 + 1)',
    description: 'Full binary tree with balanced symmetrical branches'
  },
  {
    label: 'Decimal & Unary Minus',
    expression: '-5.5 + 3.2 * 4 - (10 / -2)',
    description: 'Negative numbers and floating-point math'
  }
];

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'expression-tree-studio-api', timestamp: new Date().toISOString() });
});

// Presets list
app.get('/api/expressions/presets', (_req: Request, res: Response) => {
  res.json({ success: true, presets: PRESET_EXPRESSIONS });
});

// Expression parsing and tree computation endpoint
app.post('/api/tree/parse', (req: Request, res: Response) => {
  try {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string' || expression.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Expression cannot be empty. Please provide a valid arithmetic expression.'
      });
      return;
    }

    const trimmed = expression.trim();
    if (trimmed.length > 500) {
      res.status(400).json({
        success: false,
        error: 'Expression is too long (maximum 500 characters).'
      });
      return;
    }

    // 1. Tokenize
    const tokens = tokenize(trimmed);

    // 2. Infix to Postfix
    const postfixTokens = infixToPostfix(tokens);

    // 3. Build Tree
    const rawRoot = buildTreeFromPostfix(postfixTokens);

    // 4. Compute 3D Coordinates and layout metrics
    const root = compute3DTreeLayout(rawRoot);

    // 5. Compute tree statistics (prefix, postfix, infix, balance, height, node counts)
    const stats = computeTreeStats(root);

    // 6. Evaluate tree step-by-step
    const evaluation = evaluateTree(root);

    const parseResult: ParseResult = {
      root,
      stats,
      tokens,
      postfixTokens: postfixTokens.map(t => t.value),
      evaluation
    };

    res.json({
      success: true,
      data: parseResult
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'An error occurred during expression parsing.'
    });
  }
});

// List saved expressions
app.get('/api/expressions', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: savedExpressions
  });
});

// Save expression
app.post('/api/expressions', (req: Request, res: Response) => {
  try {
    const { expression, result, notes, isFavorite } = req.body;

    if (!expression) {
      res.status(400).json({ success: false, error: 'Expression is required.' });
      return;
    }

    const newSaved: SavedExpression = {
      id: `expr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'default-user',
      expression: expression.trim(),
      result: Number(result) || 0,
      isFavorite: Boolean(isFavorite),
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    savedExpressions.unshift(newSaved);

    res.status(201).json({
      success: true,
      data: newSaved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle favorite status
app.patch('/api/expressions/:id/favorite', (req: Request, res: Response) => {
  const { id } = req.params;
  const target = savedExpressions.find(e => e.id === id);

  if (!target) {
    res.status(404).json({ success: false, error: 'Expression not found.' });
    return;
  }

  target.isFavorite = !target.isFavorite;
  target.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    data: target
  });
});

// Delete saved expression
app.delete('/api/expressions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = savedExpressions.length;
  savedExpressions = savedExpressions.filter(e => e.id !== id);

  if (savedExpressions.length === initialLength) {
    res.status(404).json({ success: false, error: 'Expression not found.' });
    return;
  }

  res.json({
    success: true,
    message: 'Expression removed successfully.'
  });
});

app.listen(PORT, () => {
  console.log(`[Expression Tree Studio API] Server running on port ${PORT}`);
});
