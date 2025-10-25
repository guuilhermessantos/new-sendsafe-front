'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { AnalyticsCards } from '@/components/analytics/AnalyticsCards';

interface DashboardSummary {
  totalXmls: number;
  totalProducts: number;
  totalPdfs: number;
  recentUploads: number;
  errorXmls: number;
  successRate: number;
  lastUpload?: {
    originalName: string;
    createdAt: string;
    status: string;
  };
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/dashboard-summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Análise
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visualize métricas e estatísticas dos seus XMLs e conversões
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="mt-4 sm:mt-0">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && <AnalyticsCards summary={summary} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline de Uploads - Linha */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Timeline de Uploads
                </h3>
              </div>
            </div>
            <AnalyticsCharts 
              chartType="line" 
              endpoint="uploads-timeline" 
              period={selectedPeriod}
            />
          </div>

          {/* Top Produtos - Barras */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Produtos por Valor
                </h3>
              </div>
            </div>
            <AnalyticsCharts 
              chartType="bar" 
              endpoint="top-products" 
              limit={10}
            />
          </div>
        </div>

        {/* Volume de Conversões em Massa - Área */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Volume de Conversões em Massa
              </h3>
            </div>
          </div>
          <AnalyticsCharts 
            chartType="area" 
            endpoint="bulk-volume" 
            period={selectedPeriod}
          />
        </div>
      </div>
    </Layout>
  );
}
