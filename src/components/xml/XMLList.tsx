'use client';

import React, { useState, useEffect } from 'react';
import { xmlAPI, XMLFile } from '@/lib/api';
import { formatFileSize, formatDate } from '@/lib/utils';
import { FileText, Download, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface XMLListProps {
  onEdit: (file: XMLFile) => void;
  onView: (file: XMLFile) => void;
  onDelete: (id: string) => void;
  refreshTrigger: number;
}

export function XMLList({ onEdit, onView, onDelete, refreshTrigger }: XMLListProps) {
  const [files, setFiles] = useState<XMLFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const limit = 10;

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await xmlAPI.list(page, limit);
      setFiles(response.files);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar XMLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [page, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este XML?')) return;

    try {
      setDeleting(id);
      await xmlAPI.delete(id);
      await loadFiles();
    } catch (error) {
      console.error('Erro ao deletar XML:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (file: XMLFile) => {
    try {
      const blob = await xmlAPI.download(file.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar XML:', error);
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

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Nenhum XML encontrado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Faça upload do seu primeiro arquivo XML
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.originalName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(file)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(file)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.id)}
                loading={deleting === file.id}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {total > limit && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              Página {page} de {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
