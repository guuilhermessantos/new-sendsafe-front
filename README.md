# SendSafe Frontend

Aplicação frontend para conversão de XMLs para PDF com autenticação JWT.

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login e registro de usuários
- Autenticação JWT
- Proteção de rotas

### 📄 Gerenciamento de XMLs
- Upload de arquivos XML (até 10MB)
- Visualização e edição de XMLs
- Download de XMLs editados
- Listagem paginada de arquivos

### 📋 Conversão para PDF
- Conversão individual de XML para PDF (DANFE, CTE)
- Download de PDFs gerados
- Histórico de conversões

### ⚡ Conversão em Massa
- Upload de até 100 XMLs simultaneamente
- Acompanhamento de progresso em tempo real
- Download de ZIP com todos os PDFs
- Histórico de conversões em massa

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Dropzone** - Upload de arquivos

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd new-sendsafe-front
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e configure:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Execute o projeto:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 🔧 Configuração

### Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL` - URL da API backend (padrão: http://localhost:3001)

### API Endpoints

A aplicação se conecta com a API SendSafe que deve estar rodando na porta 3001. Certifique-se de que a API está configurada e rodando antes de usar a aplicação.

## 📱 Uso

### 1. Autenticação
- Acesse `/login` para fazer login
- Acesse `/register` para criar uma nova conta
- Após o login, você será redirecionado para o dashboard

### 2. Gerenciamento de XMLs
- Acesse `/xml` para gerenciar seus XMLs
- Faça upload de arquivos XML
- Visualize e edite o conteúdo dos XMLs
- Baixe os arquivos editados

### 3. Conversão em Massa
- Acesse `/bulk` para conversão em massa
- Selecione até 100 arquivos XML
- Acompanhe o progresso da conversão
- Baixe o ZIP com todos os PDFs

## 🎨 Design

O design da aplicação é inspirado no Stripe e Notion, com:
- Interface limpa e moderna
- Tema escuro/claro
- Componentes reutilizáveis
- Animações suaves
- Responsividade completa

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas da aplicação
│   ├── dashboard/         # Dashboard principal
│   ├── login/            # Página de login
│   ├── xml/              # Gerenciamento de XMLs
│   └── bulk/             # Conversão em massa
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticação
│   ├── bulk/             # Componentes de conversão em massa
│   ├── layout/           # Componentes de layout
│   └── xml/              # Componentes de XML
├── contexts/             # Contextos React
├── lib/                  # Utilitários e configurações
└── types/                # Tipos TypeScript
```

## 🚀 Deploy

Para fazer deploy da aplicação:

1. Configure as variáveis de ambiente de produção
2. Execute o build:
```bash
npm run build
```

3. Inicie a aplicação:
```bash
npm start
```

## 📝 Licença

Este projeto está sob a licença MIT.