'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { XMLUpload } from '@/components/xml/XMLUpload';
import { XMLList } from '@/components/xml/XMLList';
import { XMLEditor } from '@/components/xml/XMLEditor';
import { XMLViewer } from '@/components/xml/XMLViewer';
import { XMLFile } from '@/lib/api';
import { FileText, Upload } from 'lucide-react';

export default function XMLPage() {
  const [selectedFile, setSelectedFile] = useState<XMLFile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (file: XMLFile) => {
    setRefreshTrigger(prev => prev + 1);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleEdit = (file: XMLFile) => {
    setSelectedFile(file);
    setShowEditor(true);
  };

  const handleView = (file: XMLFile) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  const handleDelete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedFile(null);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedFile(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar XMLs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload, edite e baixe seus arquivos XML
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload de XML
                </h2>
              </div>
              <XMLUpload onUpload={handleUpload} onError={handleError} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Seus XMLs
                </h2>
              </div>
              <XMLList
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>

        {showEditor && (
          <XMLEditor
            file={selectedFile}
            onClose={handleCloseEditor}
            onSave={handleSave}
          />
        )}

        {showViewer && (
          <XMLViewer
            file={selectedFile}
            onClose={handleCloseViewer}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Layout>
  );
}
