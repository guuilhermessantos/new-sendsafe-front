'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { xmlAPI } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

interface XMLUploadProps {
  onUpload: (files: any[]) => void;
  onError: (error: string) => void;
}

export function XMLUpload({ onUpload, onError }: XMLUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Validar número máximo de arquivos
    if (acceptedFiles.length > 100) {
      const errorMsg = 'Máximo de 100 arquivos por vez';
      showError('Erro no Upload', errorMsg);
      onError(errorMsg);
      return;
    }

    // Validar cada arquivo
    for (const file of acceptedFiles) {
      // Validar tamanho do arquivo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        const errorMsg = `Arquivo ${file.name} muito grande. Tamanho máximo: 10MB`;
        showError('Erro no Upload', errorMsg);
        onError(errorMsg);
        return;
      }

      // Validar tipo do arquivo
      if (!file.name.toLowerCase().endsWith('.xml')) {
        const errorMsg = `Arquivo ${file.name} não é XML. Apenas arquivos XML são aceitos`;
        showError('Erro no Upload', errorMsg);
        onError(errorMsg);
        return;
      }
    }

    try {
      setUploading(true);
      setUploadedFiles([]);
      setUploadProgress({});
      
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          const uploadedFile = await xmlAPI.upload(file);
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          setUploadedFiles(prev => [...prev, uploadedFile]);
          
          return uploadedFile;
        } catch (error: any) {
          const errorMsg = `Erro ao fazer upload de ${file.name}: ${error.response?.data?.message || 'Erro desconhecido'}`;
          showError('Erro no Upload', errorMsg);
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        showSuccess('Upload Concluído', `${successfulUploads.length} arquivo(s) enviado(s) com sucesso!`);
        onUpload(successfulUploads);
      }

      if (results.some(result => result.status === 'rejected')) {
        const failedCount = results.filter(result => result.status === 'rejected').length;
        showError('Upload Parcial', `${failedCount} arquivo(s) falharam no upload`);
      }

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao fazer upload dos arquivos';
      showError('Erro no Upload', errorMsg);
      onError(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [onUpload, onError, showSuccess, showError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
    },
    maxFiles: 100,
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
            {uploading ? 'Fazendo upload...' : 'Arraste os XMLs aqui'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ou clique para selecionar arquivos (até 100)
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Formatos aceitos: .xml</p>
          <p>Tamanho máximo: 10MB por arquivo</p>
          <p>Máximo: 100 arquivos por vez</p>
        </div>

        {uploading && Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Progresso do upload:
            </p>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-48">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
