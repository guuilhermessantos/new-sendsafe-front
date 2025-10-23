'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BulkUpload } from '@/components/bulk/BulkUpload';
import { BulkStatus } from '@/components/bulk/BulkStatus';
import { BulkHistory } from '@/components/bulk/BulkHistory';
import { Zap, History, Upload } from 'lucide-react';

export default function BulkPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'status' | 'history'>('upload');
  const [currentConversionId, setCurrentConversionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (conversionId: string) => {
    setCurrentConversionId(conversionId);
    setActiveTab('status');
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleViewStatus = (conversionId: string) => {
    setCurrentConversionId(conversionId);
    setActiveTab('status');
  };

  const handleComplete = () => {
    setActiveTab('history');
    setCurrentConversionId(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conversão em Massa
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Converta até 100 XMLs para PDF de uma só vez
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'upload'
                    ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </div>
              </button>
              
              {currentConversionId && (
                <button
                  onClick={() => setActiveTab('status')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'status'
                      ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload de Múltiplos XMLs
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Selecione até 100 arquivos XML para conversão em massa
                  </p>
                </div>
                <BulkUpload onUpload={handleUpload} onError={handleError} />
              </div>
            )}

            {activeTab === 'status' && currentConversionId && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Status da Conversão
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acompanhe o progresso da sua conversão em massa
                  </p>
                </div>
                <BulkStatus
                  conversionId={currentConversionId}
                  onComplete={handleComplete}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Histórico de Conversões
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Visualize todas as suas conversões em massa
                  </p>
                </div>
                <BulkHistory onViewStatus={handleViewStatus} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
