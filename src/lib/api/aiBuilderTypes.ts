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
  sourcePort: string;
  targetPort: string;
  id: string;
  sourceId: string;
  targetId: string;
}

// Updated AIModel interface to fix the lastUsed type issue
export interface AIModel {
  id: string;
  name: string;
  description: string; // Changed from optional to required
  status?: string;
  type?: string;
  userId: number;
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
  canvasData?: any;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  // Fix the lastUsed type to allow null
  conversations?: number;
  satisfaction?: number;
  lastUsed?: string | null; // Changed from string | undefined to string | null
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