import { Token, TokenType, TreeNode, TreeStats } from '../types.js';

const PRECEDENCE: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
  '+': { prec: 1, assoc: 'L' },
  '-': { prec: 1, assoc: 'L' },
  '*': { prec: 2, assoc: 'L' },
  '/': { prec: 2, assoc: 'L' },
  '%': { prec: 2, assoc: 'L' },
  '^': { prec: 3, assoc: 'R' },
};

/**
 * Tokenize input string into tokens with position tracking.
 * Accurately supports unary minus (e.g. -5 or 3 * -2).
 */
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  const clean = expr.trim();
  let i = 0;

  while (i < clean.length) {
    const ch = clean[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimals, and leading unary minus if context indicates)
    const prevToken = tokens[tokens.length - 1];
    const isUnaryMinus =
      ch === '-' &&
      (!prevToken ||
        prevToken.type === 'OPERATOR' ||
        prevToken.type === 'LPAREN');

    if (/\d/.test(ch) || (ch === '.' && /\d/.test(clean[i + 1] || '')) || isUnaryMinus) {
      const start = i;
      let numStr = '';

      if (isUnaryMinus) {
        numStr += '-';
        i++;
        // Skip spaces between unary minus and number if any
        while (i < clean.length && /\s/.test(clean[i])) {
          i++;
        }
      }

      let hasDot = false;
      while (i < clean.length) {
        const c = clean[i];
        if (/\d/.test(c)) {
          numStr += c;
          i++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          numStr += c;
          i++;
        } else {
          break;
        }
      }

      if (numStr === '-' || numStr === '.') {
        throw new Error(`Invalid number format at character index ${start}: "${numStr}"`);
      }

      tokens.push({
        type: 'NUMBER',
        value: numStr,
        position: start,
      });
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
      continue;
    }

    // Operators
    if (ch in PRECEDENCE) {
      tokens.push({ type: 'OPERATOR', value: ch, position: i });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i + 1}`);
  }

  if (tokens.length === 0) {
    throw new Error('Expression is empty. Please enter an arithmetic expression.');
  }

  return tokens;
}

/**
 * Shunting-Yard Algorithm: converts infix tokens to postfix (RPN)
 */
export function infixToPostfix(tokens: Token[]): Token[] {
  const outputQueue: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'OPERATOR') {
      const o1 = token.value;
      const o1Meta = PRECEDENCE[o1];

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'OPERATOR') {
          const o2 = top.value;
          const o2Meta = PRECEDENCE[o2];
          if (
            (o1Meta.assoc === 'L' && o1Meta.prec <= o2Meta.prec) ||
            (o1Meta.assoc === 'R' && o1Meta.prec < o2Meta.prec)
          ) {
            outputQueue.push(opStack.pop()!);
            continue;
          }
        }
        break;
      }
      opStack.push(token);
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundMatchingLparen = false;
      while (opStack.length > 0) {
        const top = opStack.pop()!;
        if (top.type === 'LPAREN') {
          foundMatchingLparen = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundMatchingLparen) {
        throw new Error('Mismatched parentheses: unexpected closing parenthesis ")"');
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses: unclosed opening parenthesis "("');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Construct Binary Expression Tree from Postfix tokens
 */
export function buildTreeFromPostfix(postfixTokens: Token[]): TreeNode {
  const stack: TreeNode[] = [];
  let nodeCounter = 0;

  for (const token of postfixTokens) {
    if (token.type === 'NUMBER') {
      const num = parseFloat(token.value);
      const node: TreeNode = {
        id: `node-${++nodeCounter}`,
        value: token.value,
        numericValue: num,
        type: 'operand',
        depth: 0,
        x: 0,
        y: 0,
        z: 0,
      };
      stack.push(node);
    } else if (token.type === 'OPERATOR') {
      if (stack.length < 2) {
        throw new Error(`Invalid syntax near operator '${token.value}': not enough operands.`);
      }
      const right = stack.pop()!;
      const left = stack.pop()!;

      const node: TreeNode = {
        id: `node-${++nodeCounter}`,
        value: token.value,
        operator: token.value,
        type: 'operator',
        left,
        right,
        depth: 0,
        x: 0,
        y: 0,
        z: 0,
      };
      stack.push(node);
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression: syntax error or missing operators between numbers.');
  }

  return stack[0];
}

/**
 * Assign depth and 3D layout coordinates to tree nodes.
 * Layout algorithm calculates horizontal span (width) for subtrees so no overlap occurs.
 */
export function compute3DTreeLayout(root: TreeNode): TreeNode {
  // First pass: compute depth and leaf-based subtree width
  function measureSubtree(node: TreeNode, depth: number): number {
    node.depth = depth;
    if (!node.left && !node.right) {
      node.subtreeWidth = 1.6;
      return node.subtreeWidth;
    }
    const leftW = node.left ? measureSubtree(node.left, depth + 1) : 0.8;
    const rightW = node.right ? measureSubtree(node.right, depth + 1) : 0.8;
    node.subtreeWidth = leftW + rightW + 0.5;
    return node.subtreeWidth;
  }

  measureSubtree(root, 0);

  // Second pass: position nodes in 3D
  // Y goes downwards per level (root at top)
  // X centers children below parent with slight subtle Z curvature for an appealing 3D canopy
  const LEVEL_HEIGHT = 2.2;

  function positionNodes(node: TreeNode, x: number, y: number, z: number) {
    node.x = parseFloat(x.toFixed(3));
    node.y = parseFloat(y.toFixed(3));
    node.z = parseFloat(z.toFixed(3));

    if (!node.left && !node.right) return;

    const leftWidth = node.left?.subtreeWidth || 1;
    const rightWidth = node.right?.subtreeWidth || 1;
    const totalSpan = (leftWidth + rightWidth) * 0.7;

    const leftOffset = -totalSpan / 2;
    const rightOffset = totalSpan / 2;

    // Slight arc forward in Z for deeper nodes to give depth immersion
    const nextZ = (node.depth + 1) * 0.25 * (node.left ? -1 : 1);

    if (node.left) {
      positionNodes(node.left, x + leftOffset, y - LEVEL_HEIGHT, z + Math.sin(node.depth) * 0.3);
    }
    if (node.right) {
      positionNodes(node.right, x + rightOffset, y - LEVEL_HEIGHT, z - Math.sin(node.depth) * 0.3);
    }
  }

  positionNodes(root, 0, 0, 0);
  return root;
}

/**
 * Calculate structural statistics for the expression tree
 */
export function computeTreeStats(root: TreeNode): TreeStats {
  let total = 0;
  let leaves = 0;
  let operators = 0;

  function traverse(node: TreeNode | null | undefined): number {
    if (!node) return 0;
    total++;
    if (node.type === 'operand') leaves++;
    if (node.type === 'operator') operators++;

    const leftH = traverse(node.left);
    const rightH = traverse(node.right);
    return Math.max(leftH, rightH) + 1;
  }

  const height = traverse(root);

  // Check balance: height diff <= 1 for all nodes
  function checkBalance(node: TreeNode | null | undefined): { balanced: boolean; h: number } {
    if (!node) return { balanced: true, h: 0 };
    const left = checkBalance(node.left);
    const right = checkBalance(node.right);
    const balanced = left.balanced && right.balanced && Math.abs(left.h - right.h) <= 1;
    return { balanced, h: Math.max(left.h, right.h) + 1 };
  }

  const isBalanced = checkBalance(root).balanced;

  // Prefix: Root, Left, Right
  function toPrefix(node: TreeNode | null | undefined): string[] {
    if (!node) return [];
    return [node.value, ...toPrefix(node.left), ...toPrefix(node.right)];
  }

  // Postfix: Left, Right, Root
  function toPostfix(node: TreeNode | null | undefined): string[] {
    if (!node) return [];
    return [...toPostfix(node.left), ...toPostfix(node.right), node.value];
  }

  // Infix with minimal parentheses
  function toInfix(node: TreeNode | null | undefined): string {
    if (!node) return '';
    if (node.type === 'operand') return node.value;
    const l = toInfix(node.left);
    const r = toInfix(node.right);
    return `(${l} ${node.value} ${r})`;
  }

  return {
    height,
    totalNodes: total,
    leafNodes: leaves,
    operatorNodes: operators,
    isBalanced,
    prefix: toPrefix(root).join(' '),
    postfix: toPostfix(root).join(' '),
    infix: toInfix(root),
  };
}
