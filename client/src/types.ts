export type NodeType = 'operator' | 'operand';

export interface TreeNode {
  id: string;
  value: string;
  numericValue?: number;
  type: NodeType;
  operator?: string;
  left?: TreeNode | null;
  right?: TreeNode | null;
  depth: number;
  x: number;
  y: number;
  z: number;
  subtreeWidth?: number;
  stepIndex?: number;
  evaluatedValue?: number;
}

export type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface EvalStep {
  stepIndex: number;
  nodeId: string;
  nodeValue: string;
  type: NodeType;
  operation?: string;
  leftVal?: number;
  rightVal?: number;
  resultVal: number;
  description: string;
  stackState: { id: string; val: number }[];
  activeNodeIds: string[];
}

export interface TreeStats {
  height: number;
  totalNodes: number;
  leafNodes: number;
  operatorNodes: number;
  isBalanced: boolean;
  prefix: string;
  postfix: string;
  infix: string;
}

export interface ParseResult {
  root: TreeNode;
  stats: TreeStats;
  tokens: Token[];
  postfixTokens: string[];
  evaluation: {
    result: number;
    steps: EvalStep[];
  };
}

export interface SavedExpression {
  id: string;
  userId: string;
  expression: string;
  result: number;
  isFavorite: boolean;
  notes?: string;
  treeSnapshot?: TreeNode;
  createdAt: string;
  updatedAt: string;
}

export interface PresetItem {
  label: string;
  expression: string;
  description: string;
}
