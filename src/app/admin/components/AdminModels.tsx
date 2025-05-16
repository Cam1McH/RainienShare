'use client';

import { useState, useEffect } from 'react';
import { Edit, Eye, XCircle, Download, Filter } from 'lucide-react';

interface ModelData {
  id: number;
  name: string;
  createdBy: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  usage: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminModelsProps {
  theme: 'dark' | 'light';
  searchQuery: string;
}

export default function AdminModels({ theme, searchQuery }: AdminModelsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<ModelData[]>([]);

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API
        // const response = await fetch('/api/admin/models');
        // const data = await response.json();
        
        // For demonstration, using mock data with a delay
        setTimeout(() => {
          setModels([
            { 
              id: 1, 
              name: 'Customer Support Assistant', 
              createdBy: 'John Doe', 
              type: 'chatbot', 
              status: 'published', 
              usage: 1254,
              createdAt: '2023-10-15',
              updatedAt: '2023-11-05'
            },
            { 
              id: 2, 
              name: 'Product Recommendation Engine', 
              createdBy: 'Jane Smith', 
              type: 'recommendation', 
              status: 'published', 
              usage: 3450,
              createdAt: '2023-09-22',
              updatedAt: '2023-10-30'
            },
            { 
              id: 3, 
              name: 'Marketing Copy Generator', 
              createdBy: 'Bob Johnson', 
              type: 'content', 
              status: 'draft', 
              usage: 0,
              createdAt: '2023-11-08',
              updatedAt: '2023-11-08'
            },
            { 
              id: 4, 
              name: 'Sales Lead Qualifier', 
              createdBy: 'Alice Williams', 
              type: 'classifier', 
              status: 'published', 
              usage: 876,
              createdAt: '2023-10-12',
              updatedAt: '2023-11-02'
            },
            { 
              id: 5, 
              name: 'Sentiment Analysis Tool', 
              createdBy: 'Mike Chen', 
              type: 'analysis', 
              status: 'archived', 
              usage: 2301,
              createdAt: '2023-08-30',
              updatedAt: '2023-10-15'
            },
          ]);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching models:', error);
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Filter models based on search query
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    model.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border shadow-sm overflow-hidden`}>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          AI Models
        </h2>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  <th className="text-left pb-4 font-medium">Model Name</th>
                  <th className="text-left pb-4 font-medium">Created By</th>
                  <th className="text-left pb-4 font-medium">Type</th>
                  <th className="text-left pb-4 font-medium">Status</th>
                  <th className="text-left pb-4 font-medium">Usage</th>
                  <th className="text-left pb-4 font-medium">Last Updated</th>
                  <th className="text-right pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map(model => (
                  <tr 
                    key={model.id} 
                    className={`border-t ${
                      theme === 'dark' ? 'border-gray-800 hover:bg-[#1e1e2d]' : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <td className="py-4 pr-4">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{model.name}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-gray-500">{model.createdBy}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {model.type}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        model.status === 'published' 
                          ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : model.status === 'draft'
                            ? theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                            : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {model.status}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {model.usage.toLocaleString()} queries
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-gray-500">{model.updatedAt}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className={`p-1 rounded ${
                          theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}>
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className={`p-1 rounded ${
                          theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}>
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className={`p-1 rounded ${
                          theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}>
                          <XCircle className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}