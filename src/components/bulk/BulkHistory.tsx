'use client';

import React, { useState, useEffect } from 'react';
import { bulkAPI, BulkConversion } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Download, X, CheckCircle, Clock, AlertCircle, Loader, Eye } from 'lucide-react';

interface BulkHistoryProps {
  onViewStatus: (conversionId: string) => void;
}

export function BulkHistory({ onViewStatus }: BulkHistoryProps) {
  const [conversions, setConversions] = useState<BulkConversion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversions = async () => {
    try {
      setLoading(true);
      const data = await bulkAPI.list();
      setConversions(data);
    } catch (error) {
      console.error('Erro ao carregar conversões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-600" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const handleDownload = async (conversionId: string) => {
    try {
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
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Nenhuma conversão encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Inicie uma conversão em massa para ver o histórico
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversions.map((conversion) => (
        <div
          key={conversion.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(conversion.status)}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Conversão {conversion.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conversion.totalFiles} arquivos • {formatDate(conversion.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversion.status)}`}>
                {getStatusText(conversion.status)}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewStatus(conversion.id)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {conversion.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(conversion.id)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {conversion.status === 'processing' && (
            <div className="mt-4">
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
          )}
        </div>
      ))}
    </div>
  );
}
