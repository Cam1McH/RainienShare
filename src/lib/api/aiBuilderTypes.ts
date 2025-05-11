import { AINodeType as FrontendNodeType } from '@/app/dashboard/components/AIBuilder/types';
import { ReactNode } from 'react'; // Add this import for ReactNode


// General types
export type AINodeType = FrontendNodeType;

// Define our own types for MySQL results
export interface RowDataPacket {
  [key: string]: any;
}

export interface ResultSetHeader {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

// Request types
export interface CreateModelRequest {
  name: string;
  description?: string;
  type?: string;
  status?: string;
  template?: string;
  templateId?: string;   // Add this line
  isPublic?: boolean;
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
  canvasData?: any;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  status?: string;
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
  canvasData?: any;
  isPublic?: boolean;
}

export interface CreateNodeRequest {
  id: string;
  type: AINodeType;
  title: string;
  description?: string;
  x: number;
  y: number;
  data?: any;
}

export interface CreateConnectionRequest {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
}

// Response types
export interface AINodeData {
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
  // Add any fields AIModelsSection expects, like these:
  sourcePort?: string;
  targetPort?: string;
}

export interface AIModel {
  id: string;
  userId: number;
  name: string;
  description: string;
  status?: string;
  type?: string;
  templateId?: string;  // Add this line to match what AIModelsSection expects
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
  canvasData?: any;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  conversations?: number;
  satisfaction?: number;
  lastUsed?: string | null;
}

export interface KnowledgeBase {
  id: string;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BotTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  popular?: boolean;
  features: string[];
  nodes: AINodeData[];
  connections: AIConnectionData[];
}
