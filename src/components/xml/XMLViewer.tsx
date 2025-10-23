'use client';

import React, { useState, useEffect } from 'react';
import { xmlAPI, pdfAPI, XMLFile, PDFFile } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { X, Download, Edit, FileText, Eye } from 'lucide-react';

interface XMLViewerProps {
  file: XMLFile | null;
  onClose: () => void;
  onEdit: (file: XMLFile) => void;
}

export function XMLViewer({ file, onClose, onEdit }: XMLViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'xml' | 'pdf'>('xml');
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PDFFile | null>(null);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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
      const pdfFiles = await pdfAPI.listByXml(file.id);
      
      // Garantir que pdfFiles seja um array
      const pdfsArray = Array.isArray(pdfFiles) ? pdfFiles : [];
      setPdfs(pdfsArray);
      
      if (pdfsArray.length > 0) {
        setSelectedPdf(pdfsArray[0]);
        // Criar preview do primeiro PDF automaticamente
        createPdfPreview(pdfsArray[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
      setPdfs([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoadingPdfs(false);
    }
  };

  const createPdfPreview = async (pdfFile: PDFFile) => {
    try {
      setLoadingPreview(true);
      
      // Limpa o preview anterior
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }

      // Baixa o PDF e cria URL local para preview
      const blob = await pdfAPI.download(pdfFile.id);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('Erro ao criar preview do PDF:', error);
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
              onClick={() => onEdit(file)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
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
              Pré-visualizar PDF
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
                    <p className="text-gray-600 dark:text-gray-400">Carregando PDFs...</p>
                  </div>
                </div>
              ) : !Array.isArray(pdfs) || pdfs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum PDF encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Não há PDFs convertidos para este XML ainda.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Seletor de PDF */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selecione o PDF para visualizar:
                    </label>
                    <select
                      value={selectedPdf?.id || ''}
                      onChange={(e) => {
                        const pdf = pdfs.find(p => p.id === e.target.value);
                        setSelectedPdf(pdf || null);
                        if (pdf) {
                          createPdfPreview(pdf);
                        }
                      }}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Array.isArray(pdfs) && pdfs.map((pdf) => (
                        <option key={pdf.id} value={pdf.id}>
                          {pdf.filename} ({pdf.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Iframe para visualização do PDF */}
                  {selectedPdf && (
                    <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      {loadingPreview ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Carregando preview...</p>
                          </div>
                        </div>
                      ) : pdfPreviewUrl ? (
                        <iframe
                          src={pdfPreviewUrl}
                          className="w-full h-full"
                          title={`Visualização do PDF: ${selectedPdf.filename}`}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Erro ao carregar preview do PDF
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
