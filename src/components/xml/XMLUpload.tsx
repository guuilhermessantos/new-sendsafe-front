'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { xmlAPI } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

interface XMLUploadProps {
  onUpload: (file: any) => void;
  onError: (error: string) => void;
}

export function XMLUpload({ onUpload, onError }: XMLUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validar tamanho do arquivo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    // Validar tipo do arquivo
    if (!file.name.toLowerCase().endsWith('.xml')) {
      onError('Apenas arquivos XML são aceitos');
      return;
    }

    try {
      setUploading(true);
      const uploadedFile = await xmlAPI.upload(file);
      onUpload(uploadedFile);
    } catch (error: any) {
      onError(error.response?.data?.message || 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
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
            {uploading ? 'Fazendo upload...' : 'Arraste o XML aqui'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ou clique para selecionar um arquivo
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Formatos aceitos: .xml</p>
          <p>Tamanho máximo: 10MB</p>
        </div>
      </div>
    </div>
  );
}
