# ✅ Rotas do Backend (Porta 5000) - IMPLEMENTADAS

O backend já possui todas as rotas necessárias implementadas e funcionais! 🚀

## 1. Conversão de XML para PDF

**POST** `/api/pdf/convert/{xmlId}`

- **Headers**: `Authorization: Bearer {token}` (obrigatório)
- **Body**: Nenhum
- **Response**: 
```json
{
  "message": "PDF gerado com sucesso",
  "pdf": {
    "id": "pdf_123456789",
    "filename": "pdf-123456789.pdf",
    "type": "NFe",
    "size": 245760,
    "createdAt": "2025-10-23T12:11:14.560Z"
  }
}
```

## 2. Download de PDF

**GET** `/api/pdf/download/{pdfId}`

- **Headers**: `Authorization: Bearer {token}` (obrigatório)
- **Response**: 
  - **Content-Type**: `application/pdf`
  - **Content-Disposition**: `attachment; filename="pdf-123456789.pdf"`
  - **Body**: Arquivo PDF em binário

## 3. Listar PDFs por XML

**GET** `/api/pdf/xml/{xmlId}`

- **Headers**: `Authorization: Bearer {token}` (obrigatório)
- **Response**: 
```json
{
  "pdfs": [
    {
      "id": "pdf_123456789",
      "filename": "pdf-123456789.pdf",
      "path": "/uploads/pdf/pdf-123456789.pdf",
      "size": 245760,
      "type": "NFe",
      "createdAt": "2025-10-23T12:11:14.560Z"
    }
  ]
}
```

## Observações

1. **Autenticação**: Todas as rotas devem verificar o token de autorização se fornecido
2. **CORS**: O backend deve permitir requisições do frontend (localhost:3000)
3. **Tratamento de Erros**: Retornar status HTTP apropriados (400, 401, 404, 500) com mensagens de erro em JSON
4. **Validação**: Validar se o XML existe antes de tentar converter
5. **Armazenamento**: Os PDFs devem ser armazenados de forma persistente para permitir downloads posteriores

## Exemplo de Implementação (Node.js/Express)

```javascript
// Conversão de XML para PDF
app.post('/api/pdf/convert/:xmlId', async (req, res) => {
  try {
    const { xmlId } = req.params;
    
    // 1. Buscar XML no banco de dados
    const xml = await XML.findById(xmlId);
    if (!xml) {
      return res.status(404).json({ error: 'XML not found' });
    }
    
    // 2. Converter XML para PDF (usar biblioteca como puppeteer, jsPDF, etc.)
    const pdfBuffer = await convertXmlToPdf(xml.content);
    
    // 3. Salvar PDF no armazenamento
    const pdfId = `pdf_${Date.now()}`;
    const filename = `document_${xmlId}_${xml.type}.pdf`;
    await savePdfToStorage(pdfId, pdfBuffer, filename);
    
    // 4. Salvar metadados no banco
    const pdfRecord = await PDF.create({
      id: pdfId,
      filename,
      xmlId,
      type: xml.type,
      createdAt: new Date()
    });
    
    res.json(pdfRecord);
  } catch (error) {
    console.error('Error converting XML to PDF:', error);
    res.status(500).json({ error: 'Failed to convert file' });
  }
});

// Download de PDF
app.get('/api/pdf/download/:pdfId', async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { inline } = req.query;
    
    // Buscar PDF no banco
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Buscar arquivo PDF no armazenamento
    const pdfBuffer = await getPdfFromStorage(pdfId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': inline === 'true' 
        ? `inline; filename="${pdf.filename}"` 
        : `attachment; filename="${pdf.filename}"`
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Listar PDFs por XML
app.get('/api/pdf/xml/:xmlId', async (req, res) => {
  try {
    const { xmlId } = req.params;
    
    const pdfs = await PDF.find({ xmlId }).sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (error) {
    console.error('Error listing PDFs:', error);
    res.status(500).json({ error: 'Failed to list PDFs' });
  }
});
```
