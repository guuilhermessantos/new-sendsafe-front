import axios from 'axios';

// Para desenvolvimento, usar as rotas do Next.js (porta 3000)
// Para produção, usar o backend (porta 5000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? '' : 'http://localhost:5000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido, redirecionar para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Tipos para a API
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface XMLFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  xmlContent?: string;
}

export interface PDFFile {
  id: string;
  filename: string;
  xmlId: string;
  type: 'DANFE' | 'CTE' | 'OTHER';
  createdAt: string;
}

export interface BulkConversion {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalFiles: number;
  processedFiles: number;
  errorFiles: number;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

// Funções da API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get<{ valid: boolean; user?: User }>('/api/auth/verify');
    return response.data;
  },
};

export const xmlAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('xmlFile', file);
    
    const response = await api.post<XMLFile>('/api/xml/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  list: async (page = 1, limit = 10) => {
    const response = await api.get<{ files: XMLFile[]; total: number; page: number; limit: number }>(
      `/api/xml/list?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get<XMLFile>(`/api/xml/${id}`);
    return response.data;
  },
  
  edit: async (id: string, xmlContent: string) => {
    const response = await api.put<XMLFile>(`/api/xml/${id}/edit`, { xmlContent });
    return response.data;
  },
  
  download: async (id: string) => {
    const response = await api.get(`/api/xml/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/xml/${id}`);
    return response.data;
  },
};

export const pdfAPI = {
  convert: async (xmlId: string) => {
    const response = await api.post<PDFFile>(`/api/pdf/convert/${xmlId}`);
    return response.data;
  },
  
  download: async (pdfId: string) => {
    const response = await api.get(`/api/pdf/download/${pdfId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  listByXml: async (xmlId: string) => {
    const response = await api.get<PDFFile[]>(`/api/pdf/xml/${xmlId}`);
    return response.data;
  },
};

export const bulkAPI = {
  convert: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('xmlFiles[]', file);
    });
    
    const response = await api.post<{ conversionId: string }>('/api/bulk/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getStatus: async (conversionId: string) => {
    const response = await api.get<BulkConversion>(`/api/bulk/status/${conversionId}`);
    return response.data;
  },
  
  list: async () => {
    const response = await api.get<BulkConversion[]>('/api/bulk/list');
    return response.data;
  },
  
  download: async (conversionId: string) => {
    const response = await api.get(`/api/bulk/download/${conversionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  cancel: async (conversionId: string) => {
    const response = await api.post(`/api/bulk/cancel/${conversionId}`);
    return response.data;
  },
};
