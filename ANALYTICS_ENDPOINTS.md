# 📊 Endpoints de Analytics - SendSafe

Esta documentação descreve os endpoints de analytics implementados no frontend que consomem dados reais do backend.

## 🔐 Autenticação

Todos os endpoints requerem autenticação via Bearer Token:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 📈 Endpoints Implementados

### 1. Status dos XMLs (Gráfico de Pizza)

**Endpoint:** `GET /api/analytics/xml-status`

**Descrição:** Retorna a distribuição dos XMLs por status (processed, error, uploaded)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "status": "processed",
      "count": 150,
      "percentage": 75
    },
    {
      "status": "error",
      "count": 30,
      "percentage": 15
    },
    {
      "status": "uploaded",
      "count": 20,
      "percentage": 10
    }
  ],
  "total": 200,
  "summary": {
    "processed": 150,
    "error": 30,
    "uploaded": 20
  }
}
```

---

### 2. Timeline de Uploads (Gráfico de Linha)

**Endpoint:** `GET /api/analytics/uploads-timeline?period=7d`

**Parâmetros:**
- `period` (opcional): `7d`, `30d`, `90d` (padrão: `7d`)

**Descrição:** Retorna a evolução de uploads por dia

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "uploads": 15,
      "processed": 12,
      "errors": 3
    },
    {
      "date": "2024-01-02",
      "uploads": 23,
      "processed": 20,
      "errors": 3
    }
  ],
  "period": "7d",
  "totalUploads": 159,
  "totalProcessed": 140,
  "totalErrors": 19
}
```

---

### 3. Top Produtos por Valor (Gráfico de Barras)

**Endpoint:** `GET /api/analytics/top-products?limit=10`

**Parâmetros:**
- `limit` (opcional): número de produtos (padrão: `10`)

**Descrição:** Retorna os produtos com maior valor total

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Produto A",
      "totalValue": 15000.50,
      "totalQuantity": 100,
      "count": 5,
      "code": "PROD001"
    },
    {
      "name": "Produto B",
      "totalValue": 12000.75,
      "totalQuantity": 80,
      "count": 3,
      "code": "PROD002"
    }
  ],
  "total": 25,
  "limit": 10
}
```

---

### 4. Distribuição por CFOP (Gráfico de Barras Horizontais)

**Endpoint:** `GET /api/analytics/cfop-distribution`

**Descrição:** Retorna a distribuição de produtos por código CFOP

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "cfop": "5102",
      "count": 45,
      "totalValue": 25000.00,
      "totalQuantity": 150
    },
    {
      "cfop": "1102",
      "count": 30,
      "totalValue": 18000.00,
      "totalQuantity": 100
    }
  ],
  "total": 165,
  "uniqueCfops": 8
}
```

---

### 5. Volume de Conversões em Massa (Gráfico de Área)

**Endpoint:** `GET /api/analytics/bulk-volume?period=30d`

**Parâmetros:**
- `period` (opcional): `7d`, `30d`, `90d` (padrão: `30d`)

**Descrição:** Retorna o volume de arquivos processados em conversões em massa

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "totalFiles": 150,
      "processedFiles": 140,
      "errorFiles": 10,
      "conversions": 3
    },
    {
      "date": "2024-01-02",
      "totalFiles": 200,
      "processedFiles": 190,
      "errorFiles": 10,
      "conversions": 4
    }
  ],
  "period": "30d",
  "totalConversions": 30,
  "totalFiles": 1420,
  "totalProcessed": 1350,
  "totalErrors": 70
}
```

---

### 6. Resumo do Dashboard (Cards)

**Endpoint:** `GET /api/analytics/dashboard-summary`

**Descrição:** Retorna estatísticas gerais para cards do dashboard

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalXmls": 250,
    "totalProducts": 1250,
    "totalPdfs": 200,
    "recentUploads": 15,
    "errorXmls": 12,
    "lastUpload": {
      "originalName": "nfe_001.xml",
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "processed"
    },
    "successRate": 95
  }
}
```

---

## 🔄 Funcionamento dos Endpoints

### Estratégia de Fallback

Todos os endpoints implementam uma estratégia de fallback:

1. **Primeira tentativa:** Busca dados reais do backend (`${BACKEND_URL}/api/analytics/...`)
2. **Fallback:** Se o endpoint não existir no backend ou houver erro, retorna dados mockados
3. **Tratamento de erro:** Logs de erro e retorno de dados de demonstração

### Exemplo de Implementação

```typescript
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    // Buscar dados reais do backend
    const response = await fetch(`${BACKEND_URL}/api/analytics/endpoint`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // Fallback para dados mockados
      return NextResponse.json({
        success: true,
        data: mockData
      });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro no endpoint:', error);
    
    // Fallback para dados mockados em caso de erro
    return NextResponse.json({
      success: true,
      data: mockData
    });
  }
}
```

---

## 🎨 Componentes de Gráficos

### Tipos de Gráficos Implementados

1. **Pizza (PieChart):** Status dos XMLs
2. **Linha (LineChart):** Timeline de uploads com múltiplas linhas
3. **Barras (BarChart):** Top produtos por valor
4. **Barras Horizontais (HorizontalBarChart):** Distribuição por CFOP
5. **Área (AreaChart):** Volume de conversões em massa com múltiplas áreas

### Bibliotecas Utilizadas

- **Recharts:** Para renderização dos gráficos
- **Tailwind CSS:** Para estilização
- **Lucide React:** Para ícones

---

## 🚀 Como Usar

### 1. Acessar a Página

Navegue para `/analytics` ou clique no link "Analytics" no menu.

### 2. Selecionar Período

Use o seletor de período (7d, 30d, 90d) para filtrar os dados.

### 3. Visualizar Gráficos

Os gráficos são renderizados automaticamente com dados reais ou mockados.

### 4. Interagir com os Gráficos

- **Tooltips:** Passe o mouse sobre os elementos para ver detalhes
- **Legendas:** Clique nas legendas para mostrar/ocultar séries
- **Zoom:** Use o scroll do mouse para zoom (quando disponível)

---

## 📝 Notas Importantes

1. **Dados Mockados:** Atualmente os endpoints retornam dados de demonstração
2. **Backend:** Os endpoints reais precisam ser implementados no backend
3. **Autenticação:** Todos os endpoints verificam o token de autenticação
4. **Responsividade:** Os gráficos são responsivos e funcionam em mobile
5. **Performance:** Os dados são carregados sob demanda

---

## 🔧 Próximos Passos

1. **Implementar endpoints no backend** para retornar dados reais
2. **Adicionar cache** para melhor performance
3. **Implementar filtros avançados** (data personalizada, usuário específico)
4. **Adicionar exportação** de dados (PDF, Excel)
5. **Implementar notificações** em tempo real para novos dados

---

## 🐛 Troubleshooting

### Problemas Comuns

1. **Gráficos não carregam:** Verifique se o token de autenticação está válido
2. **Dados não atualizam:** Verifique a conexão com o backend
3. **Erro 401:** Token de autenticação inválido ou expirado
4. **Erro 500:** Problema no backend ou dados corrompidos

### Logs

Os erros são logados no console do navegador e no servidor para facilitar o debug.
