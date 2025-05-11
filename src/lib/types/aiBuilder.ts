// src/lib/types/aiBuilder.ts

export type AINodeType = 'input' | 'process' | 'output' | 'condition' | 'data';

export interface AINodeData {
  type: AINodeType;
  x: number;
  y: number;
  title: string;
  data: {
    description?: string;
    skillLevel?: 1 | 2 | 3 | 4 | 5;
    [key: string]: any;
  };
}

export interface AIConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface AIModel {
  id: number;
  userId: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  type: string;
  interactions: number;
  satisfaction: number;
  lastActiveAt?: Date;
  template?: string;
  isPublished: boolean;
  canvasData?: {
    scale: number;
    position: { x: number; y: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBase {
  id: number;
  userId: number;
  name: string;
  description?: string;
  status: 'ready' | 'processing' | 'error';
  fileCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseFile {
  id: number;
  knowledgeBaseId: number;
  name: string;
  originalName: string;
  type: string;
  size: number;
  path: string;
  status: 'ready' | 'processing' | 'error';
  processingResult?: {
    textContent?: string;
    metadata?: Record<string, any>;
  };
  uploadedAt: Date;
}

export interface BotTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  features: string[];
  icon?: string;
  gradient?: string;
  popular: boolean;
  nodes: AINodeData[];
  connections: AIConnectionData[];
  createdAt: Date;
}

// API Request/Response types
export interface CreateModelRequest {
  name: string;
  description?: string;
  type: string;
  templateId?: string;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  isPublished?: boolean;
}

export interface CreateNodeRequest {
  id: string;
  type: AINodeType;
  title: string;
  description?: string;
  x: number;
  y: number;
  data: Record<string, any>;
}

export interface UpdateNodeRequest {
  title?: string;
  description?: string;
  x?: number;
  y?: number;
  data?: Record<string, any>;
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

export interface UploadFileRequest {
  files: File[];
  knowledgeBaseId: number;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Canvas specific types
export interface CanvasState {
  scale: number;
  position: { x: number; y: number };
  selectedNodes: string[];
  clipboard?: {
    nodes: AINodeData[];
    connections: AIConnectionData[];
  };
}

// Security types
export interface NodePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canConnect: boolean;
}

export interface ModelPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canShare: boolean;
}