'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FileText, Download, Upload, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie seus XMLs e converta para PDF de forma simples e eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/xml"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gerenciar XMLs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload, edite e baixe seus XMLs
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/bulk"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversão em Massa
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Converta até 100 XMLs para PDF
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Análise
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize métricas e estatísticas
                </p>
              </div>
            </div>
          </Link>

          <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Downloads
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acesse seus PDFs convertidos
                </p>
              </div>
            </div>
          </div>

          <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Rápido
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arraste e solte seus arquivos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Como usar o SendSafe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">1</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Upload do XML
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Faça upload do seu arquivo XML ou use a conversão em massa
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">2</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Edite se necessário
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edite o conteúdo do XML diretamente na interface
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">3</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Baixe o PDF
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Converta para PDF (DANFE, CTE) e baixe o arquivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}