// src/lib/api/aiBuilderClient.ts
import { 
  AIModel, 
  CreateModelRequest, 
  UpdateModelRequest, 
  CreateNodeRequest, 
  CreateConnectionRequest, 
  KnowledgeBase,
  CreateKnowledgeBaseRequest} from './aiBuilderTypes';

// API base URL
const API_BASE = '/api';

// Utility function for API calls
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  userId?: number
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    (defaultHeaders as Record<string, string>)['X-User-ID'] = userId.toString();
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Models API
export async function getModels(page = 1, pageSize = 20) {
  return apiRequest<{ models: AIModel[]; pagination: any }>(`/aimodels?page=${page}&pageSize=${pageSize}`);
}

export async function getModel(modelId: string | number) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ model: AIModel }>(`/aimodels/${id}`);
}

export async function createModel(data: CreateModelRequest) {
  return apiRequest<{ modelId: string; success: boolean }>('/aimodels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateModel(modelId: string | number, data: UpdateModelRequest) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ success: boolean; message: string }>(`/aimodels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteModel(modelId: string | number) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ success: boolean; message: string }>(`/aimodels/${id}`, {
    method: 'DELETE',
  });
}

// Nodes API
export async function createNode(modelId: string | number, data: CreateNodeRequest) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ nodeId: string; success: boolean }>(`/aimodels/${id}/nodes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNode(modelId: string | number, nodeId: string, data: Partial<CreateNodeRequest>) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ success: boolean }>(`/aimodels/${id}/nodes/${nodeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNodes(modelId: string | number, nodeIds: string[]) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ success: boolean }>(`/aimodels/${id}/nodes`, {
    method: 'DELETE',
    body: JSON.stringify({ nodeIds }),
  });
}

// Connections API
export async function createConnection(modelId: string | number, data: CreateConnectionRequest) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ connectionId: string; success: boolean }>(`/aimodels/${id}/connections`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteConnections(modelId: string | number, connectionIds: string[]) {
  const id = typeof modelId === 'string' ? modelId : modelId.toString();
  return apiRequest<{ success: boolean }>(`/aimodels/${id}/connections`, {
    method: 'DELETE',
    body: JSON.stringify({ connectionIds }),
  });
}

// Templates API
export async function getTemplates() {
  return apiRequest<{ templates: any[] }>('/aimodels/templates');
}

// Knowledge Bases API
export async function getKnowledgeBases() {
  return apiRequest<{ knowledgeBases: KnowledgeBase[] }>('/aimodels/knowledgebases');
}

export async function createKnowledgeBase(data: CreateKnowledgeBaseRequest) {
  return apiRequest<{ knowledgeBase: KnowledgeBase; success: boolean }>('/aimodels/knowledgebases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getKnowledgeBaseFiles(kbId: string | number) {
  const id = typeof kbId === 'string' ? kbId : kbId.toString();
  return apiRequest<{ files: any[]; success: boolean }>(`/aimodels/knowledgebases/${id}/files`);
}

export async function uploadKnowledgeBaseFiles(kbId: string | number, files: File[]) {
  const id = typeof kbId === 'string' ? kbId : kbId.toString();
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  return apiRequest<{ results: any[]; success: boolean }>(`/aimodels/knowledgebases/${id}/files`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteKnowledgeBaseFiles(kbId: string | number, fileIds: string[], userId: number) {
  const id = typeof kbId === 'string' ? kbId : kbId.toString();
  return apiRequest<{ success: boolean }>(`/aimodels/knowledgebases/${id}/files`, {
    method: 'DELETE',
    body: JSON.stringify({ fileIds }),
  }, userId);
}

// Additional helper functions

// Alternative function names for backward compatibility
export const fetchAIModels = getModels;
export const fetchAIModel = getModel;
export const createAIModel = createModel;
export const updateAIModel = updateModel;
export const deleteAIModel = deleteModel;
export const fetchTemplates = getTemplates;
export const fetchKnowledgeBases = getKnowledgeBases;
export const fetchKnowledgeBaseFiles = getKnowledgeBaseFiles;
export const uploadKnowledgeBaseFile = uploadKnowledgeBaseFiles;