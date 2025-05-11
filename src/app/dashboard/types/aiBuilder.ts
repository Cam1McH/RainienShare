export type AINodeType = 
  | 'dataSource' 
  | 'textProcessor' 
  | 'aiModel' 
  | 'dataTransformer' 
  | 'userInput' 
  | 'filter' 
  | 'codeExecutor' 
  | 'outputNode';

export interface AINode {
  id: string;
  type: AINodeType;
  position: {
    x: number;
    y: number;
  };
  data: any;
  inputs: Record<string, AINodePort>;
  outputs: Record<string, AINodePort>;
}

export interface AINodePort {
  type: string;
  connected: boolean;
}

export interface AIConnection {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  nodes: Record<string, AINode>;
  connections: AIConnection[];
  createdAt: string;
  updatedAt: string;
}