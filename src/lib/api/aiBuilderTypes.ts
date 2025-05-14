// src/lib/api/aiBuilderTypes.ts
import { AINodeType } from '@/app/dashboard/components/AIBuilder/types';

// Node data
export interface AINodeData {
  type: string | AINodeType; // Accept both string and enum
  title: string;
  description?: string; // Add description property
  x: number;
  y: number;
  data: any;
}

// Connection data
export interface AIConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
}

// AI Model type
export interface AIModel {
  id: string;
  name: string;
  description: string;
  status: string;
  type?: string; // Optional for backwards compatibility
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
  createdAt: string;
  updatedAt: string;
  conversations: number;
  satisfaction: number;
  lastUsed: string;
  userId: string; // Using userId instead of creator to match your schema
}

// Model request types
export interface CreateModelRequest {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  status?: string;
  type?: string;
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
}

// Node request types
export interface CreateNodeRequest {
  id?: string;
  type: string | AINodeType; // Accept both string and enum
  title: string;
  description?: string; // Add description property
  x: number;
  y: number;
  data?: any;
}

// Connection request types
export interface CreateConnectionRequest {
  id?: string;
  sourceId: string;
  targetId: string;
}

// Knowledge Base types
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string; // Using userId to match your schema
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
}

// Bot Template type
export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  modelData: any;
  category?: string;
  isFeatured: boolean;
}