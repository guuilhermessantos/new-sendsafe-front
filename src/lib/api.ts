import axios from 'axios';

// Para desenvolvimento, usar o backend (porta 5000)
// Para produção, usar o backend (porta 5000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-sendsafe.onrender.com';

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

export interface Product {
  index: number;
  cProd: string;
  xProd: string;
  NCM: string;
  CFOP: string;
  uCom: string;
  qCom: string;
  vUnCom: string;
  vProd: string;
  vBC: string;
  vICMS: string;
  vIPI: string;
}

export interface ProductsResponse {
  xmlId: string;
  products: Product[];
  totalProducts: number;
}

export interface UpdateProductsRequest {
  products: Product[];
}

export interface UpdateProductsResponse {
  message: string;
  file: {
    id: string;
    filename: string;
    status: string;
    updatedAt: string;
  };
  productsUpdated: number;
}

export interface PDFFile {
  id: string;
  filename: string;
  path?: string;
  size?: number;
  type: 'NFe' | 'CTe' | 'NFCe' | 'DANFE' | 'CTE' | 'OTHER';
  createdAt: string;
}

export interface PDFResponse {
  message: string;
  pdf: PDFFile;
}

export interface PDFListResponse {
  pdfs: PDFFile[];
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
  
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('xmlFiles', file);
    });
    
    const response = await api.post<{ 
      successful: number; 
      errors: string[]; 
      files: XMLFile[]; 
      message: string 
    }>('/api/xml/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutos de timeout para uploads grandes
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
  
  getProducts: async (id: string) => {
    const response = await api.get<ProductsResponse>(`/api/xml/${id}/products`);
    return response.data;
  },
  
  updateProducts: async (id: string, products: Product[]) => {
    const response = await api.put<UpdateProductsResponse>(`/api/xml/${id}/products`, { products });
    return response.data;
  },
};

export const pdfAPI = {
  convert: async (xmlId: string) => {
    const response = await api.post<PDFResponse>(`/api/pdf/convert/${xmlId}`);
    return response.data.pdf;
  },
  
  download: async (pdfId: string) => {
    const response = await api.get(`/api/pdf/download/${pdfId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  listByXml: async (xmlId: string) => {
    const response = await api.get<PDFListResponse>(`/api/pdf/xml/${xmlId}`);
    return response.data.pdfs;
  },
  
  // Nova função para converter XML para PDF usando a rota do Python
  convertWithPython: async (xmlContent: string, filename: string) => {
    try {
      console.log('Iniciando conversão para PDF...', { filename, xmlLength: xmlContent.length });
      
      // Validar se o XML parece válido
      if (!xmlContent.trim().startsWith('<?xml') && !xmlContent.trim().startsWith('<')) {
        throw new Error('Conteúdo não parece ser um XML válido');
      }
      
      console.log('Enviando XML para conversão...');
      
      const response = await axios.post('https://xml-to-danfe-py.vercel.app/convert', {
        xml: xmlContent
      }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos de timeout
      });
      
      console.log('Resposta recebida:', { 
        status: response.status, 
        contentType: response.headers['content-type'],
        dataSize: response.data.size 
      });
      
      // Verificar se a resposta é um PDF válido
      if (response.headers['content-type'] !== 'application/pdf') {
        throw new Error(`Tipo de conteúdo inválido: ${response.headers['content-type']}`);
      }
      
      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.xml', '.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Download iniciado com sucesso');
      return blob;
      
    } catch (error: any) {
      console.error('Erro na conversão para PDF:', error);
      
      // Se for um erro de resposta, tentar ler o conteúdo do erro
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        
        // Se a resposta for texto, tentar ler
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text();
          console.error('Erro do servidor:', text);
          throw new Error(`Erro do servidor: ${text}`);
        }
      }
      
      throw error;
    }
  },
  
  // Função de teste para verificar se a rota do Python está funcionando
  testPythonConnection: async () => {
    try {
      console.log('Testando conexão com o servidor Python...');
      
      const response = await axios.get('https://xml-to-danfe-py.vercel.app/api/python-converter/health', {
        timeout: 5000,
      });
      
      console.log('Conexão OK:', response.data);
      return true;
    } catch (error: any) {
      console.error('Erro na conexão:', error.message);
      return false;
    }
  },
};

export const bulkAPI = {
  convert: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('xmlFiles[]', file);
    });
    
    const response = await api.post<{ conversionId: string }>('/api/bulk/convert-official', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getStatus: async (conversionId: string) => {
    const response = await api.get<BulkConversion>(`/api/bulk/status/${conversionId}`);
    return response.data;
  },
  
  list: async () => {
    const response = await api.get<{ conversions: BulkConversion[]; pagination: any }>('/api/bulk/list');
    return response.data.conversions || [];
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
