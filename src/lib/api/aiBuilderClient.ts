// aiBuilderClient.ts

import { 
  CreateModelRequest,
  UpdateModelRequest,
  CreateNodeRequest,
  CreateConnectionRequest,
  CreateKnowledgeBaseRequest,
  AIModel,
  KnowledgeBase,
  BotTemplate
} from './aiBuilderTypes';

// API Error handling
export class APIError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function handleAPIError(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || 'An error occurred';
    throw new APIError(errorMessage, response.status);
  }

  return await response.json();
}

// AI Model functions
export async function getModels(page = 1, pageSize = 20): Promise<{ models: AIModel[], pagination: any }> {
  try {
    const response = await fetch(`/api/aimodels?page=${page}&pageSize=${pageSize}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching AI models:', error);
    throw error;
  }
}

export async function getModel(modelId: string): Promise<{ model: AIModel }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching AI model ${modelId}:`, error);
    throw error;
  }
}

// Define the response structure
interface CreateModelResponse {
  success: boolean;
  modelId: string;
  message?: string;
}
export const createModel = async (data: CreateModelRequest): Promise<CreateModelResponse> => {
  try {
    const response = await fetch('/api/aimodels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response) as CreateModelResponse;
    return result;
  } catch (error) {
    console.error('Failed to create model:', error);
    throw error;
  }
};

export const updateModel = async (modelId: string, data: UpdateModelRequest) => {
  try {
    console.log('Saving model:', modelId, data); // Add logging
    const response = await fetch(`/api/aimodels/${modelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Add more detailed error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server responded with error:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update model ${modelId}:`, error);
    throw error;
  }
};

export async function deleteModel(modelId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting AI model ${modelId}:`, error);
    throw error;
  }
}

// Node functions
export async function createNode(modelId: string, data: CreateNodeRequest): Promise<{ success: boolean, nodeId: string }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating node:', error);
    throw error;
  }
}

export async function updateNode(modelId: string, nodeId: string, data: Partial<CreateNodeRequest>): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating node ${nodeId}:`, error);
    throw error;
  }
}

export async function deleteNodes(modelId: string, nodeIds: string[]): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}/nodes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nodeIds })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting nodes:', error);
    throw error;
  }
}

// Connection functions
export async function createConnection(modelId: string, data: CreateConnectionRequest): Promise<{ success: boolean, connectionId: string }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating connection:', error);
    throw error;
  }
}

export async function deleteConnections(modelId: string, connectionIds: string[]): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/aimodels/${modelId}/connections`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ connectionIds })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting connections:', error);
    throw error;
  }
}

// Template functions
export async function fetchTemplates(): Promise<{ templates: BotTemplate[] }> {
  try {
    const response = await fetch('/api/aimodels/templates');
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

// Knowledge Base functions
export async function getKnowledgeBases(): Promise<{ knowledgeBases: KnowledgeBase[] }> {
  try {
    const response = await fetch('/api/aimodels/knowledgebases');
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    throw error;
  }
}

export async function createKnowledgeBase(data: { name: string, description?: string }): Promise<{ success: boolean, knowledgeBase: KnowledgeBase }> {
  try {
    const response = await fetch('/api/knowledge-bases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to create knowledge base:', error);
    throw error;
  }
}

export async function getKnowledgeBaseFiles(kbId: string): Promise<{ files: any[] }> {
  try {
    const response = await fetch(`/api/aimodels/knowledgebases/${kbId}/files`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching files for knowledge base ${kbId}:`, error);
    throw error;
  }
}

export async function uploadKnowledgeBaseFiles(kbId: string, files: File[]): Promise<{ success: boolean, results: any[] }> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`/api/aimodels/knowledgebases/${kbId}/files`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error uploading files to knowledge base ${kbId}:`, error);
    throw error;
  }
}

export async function deleteKnowledgeBaseFiles(kbId: string, fileIds: string[]): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/aimodels/knowledgebases/${kbId}/files`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileIds })
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting files from knowledge base ${kbId}:`, error);
    throw error;
  }
}

