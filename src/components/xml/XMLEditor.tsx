'use client';

import React, { useState, useEffect } from 'react';
import { xmlAPI, XMLFile } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Save, X, Download } from 'lucide-react';

interface XMLEditorProps {
  file: XMLFile | null;
  onClose: () => void;
  onSave: () => void;
}

export function XMLEditor({ file, onClose, onSave }: XMLEditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (file) {
      if (file.xmlContent) {
        setContent(file.xmlContent);
      } else {
        loadFileContent();
      }
    }
  }, [file]);

  const loadFileContent = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const fileData = await xmlAPI.get(file.id);
      setContent(fileData.xmlContent || '');
    } catch (error) {
      console.error('Erro ao carregar conteúdo do XML:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!file) return;

    try {
      setSaving(true);
      await xmlAPI.edit(file.id, content);
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar XML:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

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

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar XML
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {file.originalName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando conteúdo...</p>
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 border border-gray-300 rounded-lg font-mono text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Conteúdo do XML..."
            />
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
