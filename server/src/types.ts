export type NodeType = 'operator' | 'operand';

export interface TreeNode {
  id: string;
  value: string; // e.g. "+", "42", "3.14"
  numericValue?: number;
  type: NodeType;
  operator?: string;
  left?: TreeNode | null;
  right?: TreeNode | null;
  depth: number;
  // 3D coordinates for spatial rendering
  x: number;
  y: number;
  z: number;
  // Subtree metrics
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

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
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
