# Gestão Ótica - Sistema de Gestão para Óticas

Sistema completo de gestão para óticas desenvolvido com React, Convex e TailwindCSS.

## Funcionalidades

- 📋 Cadastro e gestão de clientes
- 👁️ Registro de prescrições oftálmicas
- 💰 Sistema de vendas e faturamento
- 📊 Dashboard com métricas
- 🧾 Geração de recibos
- 📱 Interface responsiva
- 🔐 Sistema de autenticação

## Tecnologias

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Convex (Database + Functions)
- **Autenticação**: Convex Auth
- **Deploy**: Vercel (Frontend) + Convex Cloud (Backend)

## Como Configurar

### 1. Configurar o Backend (Convex)

1. Crie uma conta em [Convex](https://convex.dev)
2. Instale a CLI do Convex:
   ```bash
   npm install -g convex
   ```
3. Faça login:
   ```bash
   npx convex login
   ```
4. Inicialize o projeto:
   ```bash
   npx convex dev
   ```
5. Copie a URL do deployment que aparecerá no terminal

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edite o arquivo `.env.local` e adicione sua URL do Convex:
   ```
   VITE_CONVEX_URL=https://seu-deployment.convex.cloud
   ```

### 3. Instalar Dependências e Executar

```bash
npm install
npm run dev
```

### 4. Deploy na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente na Vercel:
   - `VITE_CONVEX_URL`: https://coordinated-shrimp-401.convex.cloud
3. Deploy automático será feito a cada push

**Importante**: Certifique-se de que a variável `VITE_CONVEX_URL` está configurada corretamente no Vercel para que a aplicação funcione em produção.

### 5. Deploy do Backend

Para fazer deploy do backend Convex em produção:

```bash
npx convex deploy
```

## Estrutura do Projeto

```
├── convex/                 # Backend Convex
│   ├── schema.ts          # Schema do banco de dados
│   ├── auth.ts            # Configuração de autenticação
│   ├── clients.ts         # Funções de clientes
│   ├── sales.ts           # Funções de vendas
│   └── userProfiles.ts    # Funções de perfil
├── src/
│   ├── components/        # Componentes React
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── android/              # App Android (WebView)
└── public/               # Assets estáticos
```

## Funcionalidades Principais

### Gestão de Clientes
- Cadastro completo com dados pessoais
- Registro de prescrições oftálmicas (OD/OE)
- Histórico de compras por cliente

### Sistema de Vendas
- Registro de vendas com múltiplos itens
- Controle de armações e lentes separadamente
- Gestão de pagamentos (à vista/parcelado)
- Status de pagamento (pendente/parcial/pago)
- Geração de recibos para impressão

### Dashboard
- Métricas de vendas e faturamento
- Resumo de clientes cadastrados
- Controle de valores pendentes

## App Android

O projeto inclui um app Android nativo que funciona como um WebView da aplicação web. Para usar:

1. Abra o projeto Android no Android Studio
2. Edite `MainActivity.kt` e substitua `APP_URL` pela URL do seu app
3. Compile e instale no dispositivo

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## Licença

MIT License
