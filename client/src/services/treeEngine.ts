import type { Token, TreeNode, TreeStats, EvalStep, ParseResult } from '../types';

const PRECEDENCE: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
  '+': { prec: 1, assoc: 'L' },
  '-': { prec: 1, assoc: 'L' },
  '*': { prec: 2, assoc: 'L' },
  '/': { prec: 2, assoc: 'L' },
  '%': { prec: 2, assoc: 'L' },
  '^': { prec: 3, assoc: 'R' },
};

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  const clean = expr.trim();
  let i = 0;

  while (i < clean.length) {
    const ch = clean[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

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
        throw new Error(`Invalid number format at character ${start}: "${numStr}"`);
      }

      tokens.push({
        type: 'NUMBER',
        value: numStr,
        position: start,
      });
      continue;
    }

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

    if (ch in PRECEDENCE) {
      tokens.push({ type: 'OPERATOR', value: ch, position: i });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at character index ${i + 1}`);
  }

  if (tokens.length === 0) {
    throw new Error('Expression is empty. Please enter an arithmetic expression.');
  }

  return tokens;
}

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

export function compute3DTreeLayout(root: TreeNode): TreeNode {
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

  const LEVEL_HEIGHT = 2.0;

  function positionNodes(node: TreeNode, x: number, y: number, z: number) {
    node.x = parseFloat(x.toFixed(3));
    node.y = parseFloat(y.toFixed(3));
    node.z = parseFloat(z.toFixed(3));

    if (!node.left && !node.right) return;

    const leftWidth = node.left?.subtreeWidth || 1;
    const rightWidth = node.right?.subtreeWidth || 1;
    const totalSpan = (leftWidth + rightWidth) * 0.75;

    const leftOffset = -totalSpan / 2;
    const rightOffset = totalSpan / 2;

    if (node.left) {
      positionNodes(node.left, x + leftOffset, y - LEVEL_HEIGHT, z + Math.sin(node.depth) * 0.25);
    }
    if (node.right) {
      positionNodes(node.right, x + rightOffset, y - LEVEL_HEIGHT, z - Math.sin(node.depth) * 0.25);
    }
  }

  positionNodes(root, 0, 0, 0);
  return root;
}

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

  function checkBalance(node: TreeNode | null | undefined): { balanced: boolean; h: number } {
    if (!node) return { balanced: true, h: 0 };
    const left = checkBalance(node.left);
    const right = checkBalance(node.right);
    const balanced = left.balanced && right.balanced && Math.abs(left.h - right.h) <= 1;
    return { balanced, h: Math.max(left.h, right.h) + 1 };
  }

  const isBalanced = checkBalance(root).balanced;

  function toPrefix(node: TreeNode | null | undefined): string[] {
    if (!node) return [];
    return [node.value, ...toPrefix(node.left), ...toPrefix(node.right)];
  }

  function toPostfix(node: TreeNode | null | undefined): string[] {
    if (!node) return [];
    return [...toPostfix(node.left), ...toPostfix(node.right), node.value];
  }

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

export function evaluateTree(root: TreeNode): { result: number; steps: EvalStep[] } {
  const steps: EvalStep[] = [];
  const runtimeStack: { id: string; val: number }[] = [];
  let stepCounter = 0;

  function evaluateNode(node: TreeNode): number {
    if (node.type === 'operand') {
      const val = node.numericValue ?? parseFloat(node.value);
      if (isNaN(val)) {
        throw new Error(`Invalid numeric operand: "${node.value}"`);
      }

      node.evaluatedValue = val;
      runtimeStack.push({ id: node.id, val });

      steps.push({
        stepIndex: ++stepCounter,
        nodeId: node.id,
        nodeValue: node.value,
        type: 'operand',
        resultVal: val,
        description: `Push operand ${val} to evaluation stack`,
        stackState: runtimeStack.map((s) => ({ ...s })),
        activeNodeIds: [node.id],
      });

      return val;
    }

    if (node.type === 'operator') {
      if (!node.left || !node.right) {
        throw new Error(`Operator '${node.value}' requires both left and right operands.`);
      }

      const leftVal = evaluateNode(node.left);
      const rightVal = evaluateNode(node.right);

      runtimeStack.pop();
      runtimeStack.pop();

      const op = node.value;
      let res: number;

      switch (op) {
        case '+':
          res = leftVal + rightVal;
          break;
        case '-':
          res = leftVal - rightVal;
          break;
        case '*':
          res = leftVal * rightVal;
          break;
        case '/':
          if (Math.abs(rightVal) < 1e-12) {
            throw new Error(`Division by zero encountered: ${leftVal} / ${rightVal}`);
          }
          res = leftVal / rightVal;
          break;
        case '%':
          if (Math.abs(rightVal) < 1e-12) {
            throw new Error(`Modulo by zero encountered: ${leftVal} % ${rightVal}`);
          }
          res = leftVal % rightVal;
          break;
        case '^':
          res = Math.pow(leftVal, rightVal);
          if (isNaN(res) || !isFinite(res)) {
            throw new Error(`Invalid exponentiation result: ${leftVal} ^ ${rightVal}`);
          }
          break;
        default:
          throw new Error(`Unsupported arithmetic operator: "${op}"`);
      }

      res = Math.round((res + Number.EPSILON) * 1e10) / 1e10;
      node.evaluatedValue = res;

      runtimeStack.push({ id: node.id, val: res });

      steps.push({
        stepIndex: ++stepCounter,
        nodeId: node.id,
        nodeValue: node.value,
        type: 'operator',
        operation: op,
        leftVal,
        rightVal,
        resultVal: res,
        description: `Apply operator [ ${op} ]: ${leftVal} ${op} ${rightVal} = ${res}`,
        stackState: runtimeStack.map((s) => ({ ...s })),
        activeNodeIds: [node.id, node.left.id, node.right.id],
      });

      return res;
    }

    throw new Error(`Unknown node type on tree node ${node.id}`);
  }

  const finalResult = evaluateNode(root);
  return {
    result: finalResult,
    steps,
  };
}

export function parseExpressionLocally(expression: string): ParseResult {
  const tokens = tokenize(expression);
  const postfixTokens = infixToPostfix(tokens);
  const rawRoot = buildTreeFromPostfix(postfixTokens);
  const root = compute3DTreeLayout(rawRoot);
  const stats = computeTreeStats(root);
  const evaluation = evaluateTree(root);

  return {
    root,
    stats,
    tokens,
    postfixTokens: postfixTokens.map((t) => t.value),
    evaluation,
  };
}
