'use client';

import React, { useState, useEffect } from 'react';
import { xmlAPI, pdfAPI, XMLFile, PDFFile } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { X, Download, FileText, Eye } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface XMLViewerProps {
  file: XMLFile | null;
  onClose: () => void;
}

export function XMLViewer({ file, onClose }: XMLViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'xml' | 'pdf'>('xml');
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (file) {
      if (file.xmlContent) {
        setContent(file.xmlContent);
      } else {
        loadFileContent();
      }
    }
  }, [file]);

  useEffect(() => {
    if (activeTab === 'pdf' && file) {
      loadPdfs();
    }
  }, [activeTab, file]);

  // Cleanup: revoga o URL quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

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

  const loadPdfs = async () => {
    if (!file) return;

    try {
      setLoadingPdfs(true);
      
      // Baixar o XML como blob e converter para string
      const xmlBlob = await xmlAPI.download(file.id);
      const xmlContent = await xmlBlob.text();
      
      console.log('XML baixado para preview, tamanho:', xmlContent.length);
      
      if (!xmlContent || xmlContent.trim().length === 0) {
        throw new Error('Conteúdo XML vazio ou não encontrado');
      }
      
      // Converter XML para PDF usando a rota do Python
      await convertXmlToPdfPreview(xmlContent);
      
      showInfo('Preview Gerado', 'XML convertido para visualização em PDF');
    } catch (error) {
      console.error('Erro ao gerar preview do XML:', error);
      showError('Erro ao Gerar Preview', 'Não foi possível converter o XML para visualização');
    } finally {
      setLoadingPdfs(false);
    }
  };

  const convertXmlToPdfPreview = async (xmlContent: string) => {
    try {
      setLoadingPreview(true);
      
      // Limpa o preview anterior
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }

      console.log('Convertendo XML para PDF preview...', { xmlLength: xmlContent.length });
      
      // Usar a rota do Python para converter XML para PDF
      const response = await fetch('https://xml-to-danfe-py.vercel.app/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xml: xmlContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor (${response.status}): ${errorText}`);
      }

      // Verificar se a resposta é um PDF válido
      const contentType = response.headers.get('content-type');
      if (contentType !== 'application/pdf') {
        throw new Error(`Tipo de conteúdo inválido: ${contentType}`);
      }

      // Criar blob e URL para preview
      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);
      
      console.log('PDF preview gerado com sucesso');
    } catch (error) {
      console.error('Erro ao converter XML para PDF:', error);
      showError('Erro na Conversão', `Não foi possível converter o XML para PDF: ${(error as Error).message}`);
    } finally {
      setLoadingPreview(false);
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
              Visualizar XML
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

        {/* Abas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('xml')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'xml'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              XML
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pdf'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Visualizar PDF
            </button>
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'xml' ? (
            loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando conteúdo...</p>
                </div>
              </div>
            ) : (
              <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                {content}
              </pre>
            )
          ) : (
            <div className="h-full flex flex-col">
              {loadingPdfs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Gerando preview do XML...</p>
                  </div>
                </div>
              ) : !pdfPreviewUrl ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Erro ao carregar XML
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Não foi possível carregar o conteúdo do XML para visualização.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Erro:</h4>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Verifique se o XML está válido</li>
                        <li>• Tente recarregar a página</li>
                        <li>• Entre em contato com o suporte se o problema persistir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {loadingPreview ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Gerando preview do XML...</p>
                      </div>
                    </div>
                  ) : pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-full"
                      title="Visualização do XML como PDF"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Erro ao gerar preview do XML
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
