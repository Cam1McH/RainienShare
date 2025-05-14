export type AINodeType = 'input' | 'process' | 'output' | 'condition' | 'data';

export interface AINodeData {
  description: any;
  description: ReactNode;
  type: AINodeType;
  x: number;
  y: number;
  title: string;
  data: any;
}

export interface AIConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface AIModel {
  id?: string;
  name: string;
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
}