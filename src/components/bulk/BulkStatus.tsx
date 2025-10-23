'use client';

import React, { useState, useEffect } from 'react';
import { bulkAPI, BulkConversion } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Download, X, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

interface BulkStatusProps {
  conversionId: string;
  onComplete?: () => void;
}

export function BulkStatus({ conversionId, onComplete }: BulkStatusProps) {
  const [conversion, setConversion] = useState<BulkConversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await bulkAPI.getStatus(conversionId);
      setConversion(data);
      
      if (data.status === 'completed' || data.status === 'failed') {
        onComplete?.();
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    
    // Polling para atualizar status a cada 2 segundos se ainda estiver processando
    const interval = setInterval(() => {
      if (conversion?.status === 'processing' || conversion?.status === 'pending') {
        loadStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [conversionId, conversion?.status]);

  const handleDownload = async () => {
    if (!conversion) return;

    try {
      setDownloading(true);
      const blob = await bulkAPI.download(conversionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversao-${conversionId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivos:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!conversion) return;

    try {
      await bulkAPI.cancel(conversionId);
      loadStatus();
    } catch (error) {
      console.error('Erro ao cancelar conversão:', error);
    }
  };

  const getStatusIcon = () => {
    switch (conversion?.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-gray-600" />;
      case 'processing':
        return <Loader className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (conversion?.status) {
      case 'completed':
        return 'Concluída';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelada';
      case 'processing':
        return 'Processando';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = () => {
    switch (conversion?.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      case 'processing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!conversion) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">Conversão não encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversão em Massa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID: {conversionId}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progresso</span>
            <span>{conversion.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${conversion.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {conversion.totalFiles}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {conversion.processedFiles}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Processados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {conversion.errorFiles}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Erros</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Criado em: {formatDate(conversion.createdAt)}</span>
          {conversion.completedAt && (
            <span>Concluído em: {formatDate(conversion.completedAt)}</span>
          )}
        </div>

        <div className="flex space-x-3">
          {conversion.status === 'completed' && (
            <Button
              onClick={handleDownload}
              loading={downloading}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar ZIP
            </Button>
          )}
          
          {(conversion.status === 'pending' || conversion.status === 'processing') && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
