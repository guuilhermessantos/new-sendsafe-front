'use client';

import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

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

interface AnalyticsCardsProps {
  summary: DashboardSummary;
}

export function AnalyticsCards({ summary }: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total de XMLs',
      value: summary.totalXmls,
      icon: FileText,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Produtos Processados',
      value: summary.totalProducts,
      icon: CheckCircle,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'PDFs Gerados',
      value: summary.totalPdfs,
      icon: AlertCircle,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Uploads Recentes',
      value: summary.recentUploads,
      icon: Clock,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${summary.successRate}%`,
      icon: TrendingUp,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
    {
      title: 'XMLs com Erro',
      value: summary.errorXmls,
      icon: Activity,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
