// src/app/dashboard/components/AIBuilder/types.ts

// Basic node type definitions
export type AINodeType = 'input' | 'process' | 'output' | 'condition' | 'data';

// Node data structure
export interface AINodeData {
  type: AINodeType;
  x: number;
  y: number;
  title: string;
  data: Record<string, any>;
}

// Connection data structure
export interface AIConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: string;
  targetPort?: string;
}

// Node port definition
export interface AINodePort {
  id: string;
  type: string;
  position: 'input' | 'output';
  label?: string;
}

// Canvas state
export interface CanvasState {
  scale: number;
  position: { x: number; y: number };
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
}

// History entry for undo/redo
export interface HistoryEntry {
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validation error
export interface ValidationError {
  type: 'node' | 'connection';
  id: string;
  message: string;
}

// AI Model metadata
export interface AIModelMetadata {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  creator?: {
    id: string;
    name: string;
  };
  version?: string;
  tags?: string[];
}

// AI Model template
export interface AIModelTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: number;
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
  previewImageUrl?: string;
}

// Node type definitions - for specific node types

// Input Node Data
export interface InputNodeData extends AINodeData {
  type: 'input';
  data: {
    inputType: 'text' | 'file' | 'knowledge_base' | 'form';
    description?: string;
    placeholder?: string;
    required?: boolean;
    skillLevel?: number;
    [key: string]: any;
  };
}

// Process Node Data
export interface ProcessNodeData extends AINodeData {
  type: 'process';
  data: {
    operation: 'answer' | 'analyze' | 'transform' | 'create' | 'first_message' | 'security_filter' | 'custom_model';
    description?: string;
    skillLevel?: number;
    [key: string]: any;
  };
}

// Output Node Data
export interface OutputNodeData extends AINodeData {
  type: 'output';
  data: {
    outputType: 'text' | 'quick_replies' | 'cards' | 'image' | 'custom_ui' | 'action';
    description?: string;
    skillLevel?: number;
    [key: string]: any;
  };
}

// Condition Node Data
export interface ConditionNodeData extends AINodeData {
  type: 'condition';
  data: {
    condition: 'branch' | 'if/else' | 'switch' | 'advanced_logic';
    description?: string;
    skillLevel?: number;
    [key: string]: any;
  };
}

// Data Node Data
export interface DataNodeData extends AINodeData {
  type: 'data';
  data: {
    dataType: 'documents' | 'customer' | 'products' | 'database' | 'api' | 'workflow';
    description?: string;
    skillLevel?: number;
    [key: string]: any;
  };
}

// Type guard functions
export function isInputNode(node: AINodeData): node is InputNodeData {
  return node.type === 'input';
}

export function isProcessNode(node: AINodeData): node is ProcessNodeData {
  return node.type === 'process';
}

export function isOutputNode(node: AINodeData): node is OutputNodeData {
  return node.type === 'output';
}

export function isConditionNode(node: AINodeData): node is ConditionNodeData {
  return node.type === 'condition';
}

export function isDataNode(node: AINodeData): node is DataNodeData {
  return node.type === 'data';
}

// Theme type
export type Theme = 'light' | 'dark';