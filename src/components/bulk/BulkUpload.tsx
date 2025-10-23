'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Zap } from 'lucide-react';
import { bulkAPI } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

interface BulkUploadProps {
  onUpload: (conversionId: string) => void;
  onError: (error: string) => void;
}

export function BulkUpload({ onUpload, onError }: BulkUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => {
      // Validar tipo do arquivo
      if (!file.name.toLowerCase().endsWith('.xml')) {
        onError(`Arquivo ${file.name} não é um XML válido`);
        return false;
      }
      return true;
    });

    // Validar limite de 100 arquivos
    if (files.length + newFiles.length > 100) {
      onError('Máximo de 100 arquivos por conversão');
      return;
    }

    // Validar tamanho total (aproximadamente 1GB)
    const totalSize = [...files, ...newFiles].reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 1024 * 1024 * 1024) {
      onError('Tamanho total dos arquivos excede 1GB');
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [files, onError]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onError('Selecione pelo menos um arquivo');
      return;
    }

    try {
      setUploading(true);
      const response = await bulkAPI.convert(files);
      onUpload(response.conversionId);
      setFiles([]);
    } catch (error: any) {
      onError(error.response?.data?.message || 'Erro ao iniciar conversão em massa');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
    },
    multiple: true,
    disabled: uploading,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-gray-400 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {uploading ? 'Iniciando conversão...' : 'Arraste os XMLs aqui'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ou clique para selecionar múltiplos arquivos
            </p>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Formatos aceitos: .xml</p>
            <p>Máximo: 100 arquivos • Tamanho total: 1GB</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Arquivos selecionados ({files.length})
            </h4>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Limpar todos
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Zap className="w-5 h-5" />
            )}
            <span>
              {uploading ? 'Iniciando conversão...' : `Converter ${files.length} arquivo(s)`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
