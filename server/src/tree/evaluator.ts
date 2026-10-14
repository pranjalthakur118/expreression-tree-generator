import { EvalStep, TreeNode } from '../types.js';

export interface EvaluationResult {
  result: number;
  steps: EvalStep[];
}

/**
 * Execute post-order recursive evaluation of the Expression Tree.
 * Generates an animated step trace detailing operands pushed to stack,
 * operator resolutions, stack snapshots, and descriptive explanations.
 */
export function evaluateTree(root: TreeNode): EvaluationResult {
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

      // 1. Post-order: Evaluate Left subtree
      const leftVal = evaluateNode(node.left);

      // 2. Post-order: Evaluate Right subtree
      const rightVal = evaluateNode(node.right);

      // Pop operands from runtime stack
      runtimeStack.pop(); // right
      runtimeStack.pop(); // left

      // 3. Compute operator result
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
            throw new Error(`Invalid exponentiation result for: ${leftVal} ^ ${rightVal}`);
          }
          break;
        default:
          throw new Error(`Unsupported arithmetic operator: "${op}"`);
      }

      // Round small floating point inaccuracies (e.g. 0.1 + 0.2)
      res = Math.round((res + Number.EPSILON) * 1e10) / 1e10;
      node.evaluatedValue = res;

      // Push calculated result back onto stack
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
