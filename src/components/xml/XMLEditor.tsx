'use client';

import React, { useState, useEffect } from 'react';
import { xmlAPI, XMLFile, Product } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Save, X, Download } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface XMLEditorProps {
  file: XMLFile | null;
  onClose: () => void;
  onSave: () => void;
}

// Usando o tipo Product do backend
type Produto = Product;

export function XMLEditor({ file, onClose, onSave }: XMLEditorProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (file) {
      loadFileData();
    }
  }, [file]);

  const loadFileData = async () => {
    if (!file) return;

    try {
      setLoading(true);
      console.log('Tentando carregar produtos para XML:', file.id);
      
      // Tentar usar a nova rota do backend para obter produtos
      try {
        const productsData = await xmlAPI.getProducts(file.id);
        console.log('Produtos carregados do backend:', productsData);
        setProdutos(productsData.products);
        showInfo('Produtos Carregados', `${productsData.products.length} produtos encontrados no XML`);
        return;
      } catch (backendError) {
        console.warn('Backend não disponível, usando fallback local:', backendError);
        showInfo('Usando Extração Local', 'Backend não disponível, extraindo produtos localmente');
      }
      
      // Fallback: usar extração local
      const fileData = await xmlAPI.get(file.id);
      console.log('Carregando XML para extração local:', fileData);
      const produtosExtraidos = extrairProdutosDoXML(fileData.xmlContent || '');
      console.log('Produtos extraídos localmente:', produtosExtraidos);
      setProdutos(produtosExtraidos);
      
      if (produtosExtraidos.length > 0) {
        showSuccess('Produtos Extraídos', `${produtosExtraidos.length} produtos extraídos do XML`);
      } else {
        showInfo('Nenhum Produto Encontrado', 'Nenhum produto foi encontrado no XML');
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do XML:', error);
      showError('Erro ao Carregar', 'Não foi possível carregar os produtos do XML');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const extrairProdutosDoXML = (xmlContent: string): Produto[] => {
    try {
      console.log('Iniciando extração de produtos do XML...');
      
      // Criar um parser XML simples
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Verificar se é um XML válido
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('Erro ao fazer parse do XML');
        return [];
      }

      const produtos: Produto[] = [];
      
      // Procurar por diferentes estruturas de produtos dependendo do tipo de XML
      // NFe
      const detElements = xmlDoc.getElementsByTagName('det');
      console.log(`Encontrados ${detElements.length} elementos <det> no XML`);
      
      for (let i = 0; i < detElements.length; i++) {
        const det = detElements[i];
        const prod = det.getElementsByTagName('prod')[0];
        
        if (prod) {
          const cProd = prod.getElementsByTagName('cProd')[0]?.textContent || '';
          const xProd = prod.getElementsByTagName('xProd')[0]?.textContent || '';
          const NCM = prod.getElementsByTagName('NCM')[0]?.textContent || '';
          const CFOP = prod.getElementsByTagName('CFOP')[0]?.textContent || '';
          const uCom = prod.getElementsByTagName('uCom')[0]?.textContent || 'UN';
          const qCom = prod.getElementsByTagName('qCom')[0]?.textContent || '0';
          const vUnCom = prod.getElementsByTagName('vUnCom')[0]?.textContent || '0';
          const vProd = prod.getElementsByTagName('vProd')[0]?.textContent || '0';
          const vBC = prod.getElementsByTagName('vBC')[0]?.textContent || '0';
          const vICMS = prod.getElementsByTagName('vICMS')[0]?.textContent || '0';
          const vIPI = prod.getElementsByTagName('vIPI')[0]?.textContent || '0';
          
          if (xProd) {
            produtos.push({
              index: i,
              cProd: cProd.trim(),
              xProd: xProd.trim(),
              NCM: NCM.trim(),
              CFOP: CFOP.trim(),
              uCom: uCom.trim(),
              qCom: qCom.trim(),
              vUnCom: vUnCom.trim(),
              vProd: vProd.trim(),
              vBC: vBC.trim(),
              vICMS: vICMS.trim(),
              vIPI: vIPI.trim()
            });
            console.log(`Produto ${i + 1} extraído:`, xProd.trim());
          }
        }
      }

      // Se não encontrou produtos na NFe, tentar outras estruturas
      if (produtos.length === 0) {
        console.log('Nenhum produto encontrado na estrutura NFe, tentando estruturas genéricas...');
        
        // Tentar estrutura genérica
        const itemElements = xmlDoc.getElementsByTagName('item');
        console.log(`Encontrados ${itemElements.length} elementos <item> no XML`);
        
        for (let i = 0; i < itemElements.length; i++) {
          const item = itemElements[i];
          const descricao = item.getElementsByTagName('descricao')[0]?.textContent || 
                          item.getElementsByTagName('description')[0]?.textContent || '';
          const quantidade = item.getElementsByTagName('quantidade')[0]?.textContent || 
                           item.getElementsByTagName('quantity')[0]?.textContent || '';
          const valor = item.getElementsByTagName('valor')[0]?.textContent || 
                       item.getElementsByTagName('value')[0]?.textContent || '';
          
          if (descricao) {
            produtos.push({
              index: i,
              cProd: `ITEM_${i + 1}`,
              xProd: descricao.trim(),
              NCM: '',
              CFOP: '',
              uCom: 'UN',
              qCom: quantidade || '0',
              vUnCom: valor || '0',
              vProd: valor || '0',
              vBC: '0',
              vICMS: '0',
              vIPI: '0'
            });
            console.log(`Item genérico ${i + 1} extraído:`, descricao.trim());
          }
        }
      }

      console.log(`Total de produtos extraídos: ${produtos.length}`);
      return produtos;
    } catch (error) {
      console.error('Erro ao extrair produtos do XML:', error);
      return [];
    }
  };

  const updateProduto = (index: number, campo: keyof Produto, valor: string) => {
    setProdutos(prev => prev.map(produto => 
      produto.index === index ? { ...produto, [campo]: valor } : produto
    ));
  };

  const adicionarProduto = () => {
    const novoProduto: Produto = {
      index: produtos.length,
      cProd: '',
      xProd: '',
      NCM: '',
      CFOP: '',
      uCom: 'UN',
      qCom: '0',
      vUnCom: '0.00',
      vProd: '0.00',
      vBC: '0.00',
      vICMS: '0.00',
      vIPI: '0.00'
    };
    setProdutos(prev => [...prev, novoProduto]);
    showInfo('Produto Adicionado', 'Novo produto adicionado para edição');
  };

  const removerProduto = (index: number) => {
    setProdutos(prev => prev.filter(produto => produto.index !== index));
    showInfo('Produto Removido', 'Produto removido da lista');
  };

  const handleSave = async () => {
    if (!file) return;

    try {
      setSaving(true);
      
      // Usar a nova rota do backend para atualizar produtos
      const result = await xmlAPI.updateProducts(file.id, produtos);
      console.log('Produtos atualizados:', result);
      
      showSuccess('Produtos Salvos', `${result.productsUpdated} produtos foram atualizados com sucesso!`);
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produtos do XML:', error);
      showError('Erro ao Salvar', 'Não foi possível salvar as alterações dos produtos');
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Produtos do XML
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

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando produtos do XML...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Verifique o console do navegador para logs de debug
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cabeçalho com botão de adicionar */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Produtos ({produtos.length})
                </h3>
                <Button
                  onClick={adicionarProduto}
                  variant="outline"
                  size="sm"
                >
                  + Adicionar Produto
                </Button>
              </div>

              {/* Lista de produtos */}
              <div className="space-y-4">
                {produtos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Este XML não contém produtos ou não foi possível extrair os dados.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug:</h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Verifique o console do navegador para logs detalhados</li>
                        <li>• Certifique-se de que o XML contém elementos &lt;det&gt; ou &lt;prod&gt;</li>
                        <li>• O XML deve ser uma NFe válida para extração automática</li>
                      </ul>
                    </div>
                    <Button
                      onClick={adicionarProduto}
                      variant="outline"
                      size="sm"
                    >
                      + Adicionar Produto Manualmente
                    </Button>
                  </div>
                ) : (
                  produtos.map((produto, index) => (
                  <div key={produto.index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        Produto {index + 1}
                      </h4>
                      <Button
                        onClick={() => removerProduto(produto.index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Código do Produto
                        </label>
                        <input
                          type="text"
                          value={produto.cProd}
                          onChange={(e) => updateProduto(produto.index, 'cProd', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Ex: 001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantidade
                        </label>
                        <input
                          type="text"
                          value={produto.qCom}
                          onChange={(e) => updateProduto(produto.index, 'qCom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Ex: 3,0000"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descrição do Produto
                        </label>
                        <input
                          type="text"
                          value={produto.xProd}
                          onChange={(e) => updateProduto(produto.index, 'xProd', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Digite a descrição do produto..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Valor Unitário
                        </label>
                        <input
                          type="text"
                          value={produto.vUnCom}
                          onChange={(e) => updateProduto(produto.index, 'vUnCom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Ex: 1332.00"
                        />
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
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
