// src/lib/api/aiBuilderTypes.ts

// Base AI Node Types
export type AINodeType = 'input' | 'process' | 'output' | 'condition' | 'data';

// AI Node Data Structure
export interface AINodeData {
  type: AINodeType;
  x: number;
  y: number;
  title: string;
  data: any;
}

// AI Connection Data Structure
export interface AIConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: string;
  targetPort?: string;
}

// AI Model Data Structure
export interface AIModel {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'draft';
  nodes: Record<string, AINodeData>;
  connections: AIConnectionData[];
  templateId?: string;
  userID?: number;
  conversations?: number;
  satisfaction?: number;
  lastUsed?: string;
  createdAt?: string;
  updatedAt?: string;
  canvasData?: any;
}

// Request Types
export interface CreateModelRequest {
  name: string;
  description?: string;
  templateId?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'draft';
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
  canvasData?: any;
}

export interface CreateNodeRequest {
  id?: string;
  type: AINodeType;
  x: number;
  y: number;
  title: string;
  description?: string;
  data?: any;
}

export interface CreateConnectionRequest {
  id?: string;
  sourceId: string;
  targetId: string;
  sourcePort?: string;
  targetPort?: string;
}

// Knowledge Base Types
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  userID?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
}

export interface KBFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  kbId: string;
  uploadedAt: string;
}

export interface CreateKBFileRequest {
  name: string;
  content: string | Buffer;
  type: string;
}

// Template Types
export interface BotTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: number;
  popular?: boolean;
  nodes?: Record<string, AINodeData>;
  connections?: AIConnectionData[];
  previewUrl?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Model Response Types
export interface ModelsResponse {
  models: AIModel[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ModelResponse {
  model: AIModel;
}

export interface ModelCreateResponse {
  modelId: string;
  success: boolean;
  message?: string;
}

export interface ModelUpdateResponse {
  success: boolean;
  message: string;
}

export interface ModelDeleteResponse {
  success: boolean;
  message: string;
}

// Node Response Types
export interface NodeCreateResponse {
  nodeId: string;
  success: boolean;
  message?: string;
}

export interface NodeUpdateResponse {
  success: boolean;
  message?: string;
}

export interface NodeDeleteResponse {
  success: boolean;
  message?: string;
}

// Connection Response Types
export interface ConnectionCreateResponse {
  connectionId: string;
  success: boolean;
  message?: string;
}

export interface ConnectionDeleteResponse {
  success: boolean;
  message?: string;
}

// Knowledge Base Response Types
export interface KnowledgeBasesResponse {
  knowledgeBases: KnowledgeBase[];
}

export interface KnowledgeBaseResponse {
  knowledgeBase: KnowledgeBase;
}

export interface KBFilesResponse {
  files: KBFile[];
  success: boolean;
}

export interface KBFileUploadResponse {
  results: Array<{
    success: boolean;
    fileId?: string;
    fileName?: string;
    error?: string;
  }>;
  success: boolean;
}

// Error Types
export interface AIBuilderError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Canvas Types
export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasState {
  position: CanvasPosition;
  scale: number;
  selectedNodes: string[];
  selectedConnections: string[];
  clipboard?: {
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  };
}

// History Types
export interface HistoryState {
  past: {
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  }[];
  present: {
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  };
  future: {
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  }[];
}

// Export all types for easy importing
