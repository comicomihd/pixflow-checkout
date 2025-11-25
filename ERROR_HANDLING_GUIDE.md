# 🛡️ Guia de Tratamento de Erros - Pixflow Checkout

## 📋 Visão Geral

Sistema completo de tratamento de erros com Error Boundary e logging centralizado.

---

## 🎯 Funcionalidades

### ✅ Implementado

- [x] Error Boundary para capturar erros
- [x] Serviço de logging centralizado
- [x] Registro de erros não capturados
- [x] Registro de promise rejections
- [x] Página de visualização de logs
- [x] Exportação de logs (JSON/CSV)
- [x] Métricas de erros
- [x] Filtros de logs
- [x] Análise de erros
- [x] Armazenamento em localStorage

---

## 📁 Arquivos Criados

### Serviço (1 arquivo)
- ✅ `src/services/errorLogger.ts` - Serviço de logging

### Componente (1 arquivo)
- ✅ `src/components/ErrorBoundary.tsx` - Error Boundary

### Página (1 arquivo)
- ✅ `src/pages/ErrorLogs.tsx` - Página de logs

### Rotas (1 atualização)
- ✅ `src/App.tsx` - Rota `/error-logs` adicionada

---

## 🚀 Como Usar

### 1. Error Boundary

O Error Boundary já está configurado no App.tsx e captura automaticamente erros de componentes.

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. Usar errorLogger

```typescript
import { errorLogger } from '@/services/errorLogger';

// Log de erro
errorLogger.error('Erro ao buscar dados', error, {
  userId: '123',
  action: 'fetch-data'
});

// Log de aviso
errorLogger.warning('Dados inválidos', {
  field: 'email'
});

// Log de informação
errorLogger.info('Usuário fez login', {
  userId: '123'
});

// Log de debug
errorLogger.debug('Valor da variável', {
  value: someValue
});
```

### 3. Acessar Página de Logs

```
URL: /error-logs
Rota: Protegida (requer autenticação)
```

---

## 📊 Estrutura de Log

```typescript
interface ErrorLog {
  id: string;                    // ID único
  timestamp: string;             // ISO 8601
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;               // Mensagem de erro
  stack?: string;                // Stack trace
  context?: Record<string, any>; // Contexto adicional
  userAgent?: string;            // User agent do navegador
  url?: string;                  // URL da página
  userId?: string;               // ID do usuário
}
```

---

## 🔍 Funcionalidades do errorLogger

### Métodos Principais

```typescript
// Logging
errorLogger.error(message, error?, context?);
errorLogger.warning(message, context?);
errorLogger.info(message, context?);
errorLogger.debug(message, context?);

// Consulta
errorLogger.getLogs();                    // Todos os logs
errorLogger.getLogsByLevel('error');      // Logs de um nível
errorLogger.getRecentLogs(60);            // Últimos N minutos
errorLogger.getMetrics();                 // Métricas de erros

// Gerenciamento
errorLogger.clearLogs();                  // Limpar logs
errorLogger.exportLogs();                 // Exportar como JSON
errorLogger.exportLogsAsCSV();            // Exportar como CSV
errorLogger.downloadLogs('json');         // Download de arquivo
```

---

## 📊 Página de Error Logs

### Funcionalidades

1. **Visualização de Logs**
   - Tabela com todos os logs
   - Filtros por nível e período
   - Detalhes expandíveis

2. **Métricas**
   - Total de erros
   - Tipos de erro
   - Páginas afetadas
   - Total de logs

3. **Análise**
   - Erros por tipo
   - Erros por página
   - Gráficos de distribuição

4. **Exportação**
   - Download como JSON
   - Download como CSV
   - Limpeza de logs

---

## 🛡️ Error Boundary

### Funcionalidades

1. **Captura de Erros**
   - Captura erros de componentes
   - Registra stack trace
   - Mostra UI customizada

2. **Recuperação**
   - Botão "Tentar Novamente"
   - Botão "Voltar para Início"
   - Botão "Recarregar Página"

3. **Informações**
   - Mostra detalhes em desenvolvimento
   - Conta múltiplos erros
   - ID do erro

---

## 📈 Exemplos de Uso

### Exemplo 1: Capturar Erro de API

```typescript
import { errorLogger } from '@/services/errorLogger';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    errorLogger.error('Erro ao buscar dados da API', error, {
      endpoint: '/api/data',
      method: 'GET',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
```

### Exemplo 2: Validação de Formulário

```typescript
import { errorLogger } from '@/services/errorLogger';

function validateForm(data) {
  if (!data.email) {
    errorLogger.warning('Email não preenchido', {
      field: 'email',
      formId: 'contact-form',
    });
    return false;
  }
  return true;
}
```

### Exemplo 3: Rastreamento de Ação

```typescript
import { errorLogger } from '@/services/errorLogger';

function handlePayment(paymentData) {
  errorLogger.info('Iniciando processamento de pagamento', {
    paymentId: paymentData.id,
    amount: paymentData.amount,
    method: paymentData.method,
  });
  
  // Processar pagamento...
}
```

---

## 🔧 Configuração

### Armazenamento em localStorage

Os logs são automaticamente salvos em localStorage:

```typescript
// Carregar logs ao iniciar
errorLogger.loadFromLocalStorage();

// Logs são salvos automaticamente após cada novo log
```

### Limite de Logs

Máximo de 1000 logs em memória. Logs mais antigos são removidos.

---

## 📊 Métricas

```typescript
const metrics = errorLogger.getMetrics();

// Resultado:
{
  totalErrors: 5,
  errorsByType: {
    'network': 2,
    'validation': 2,
    'unknown': 1
  },
  errorsByPage: {
    '/checkout': 3,
    '/products': 2
  },
  lastError: { ... }
}
```

---

## 🎯 Boas Práticas

### 1. Sempre Incluir Contexto

```typescript
// ❌ Ruim
errorLogger.error('Erro ao salvar');

// ✅ Bom
errorLogger.error('Erro ao salvar usuário', error, {
  userId: user.id,
  action: 'save-user',
  timestamp: new Date().toISOString(),
});
```

### 2. Usar Níveis Apropriados

```typescript
// Erro: Falha crítica
errorLogger.error('Falha ao conectar ao banco', error);

// Aviso: Algo suspeito mas não crítico
errorLogger.warning('Resposta lenta da API', { duration: 5000 });

// Informação: Eventos importantes
errorLogger.info('Usuário fez login', { userId: '123' });

// Debug: Informações de desenvolvimento
errorLogger.debug('Valor da variável', { value: someValue });
```

### 3. Não Logar Dados Sensíveis

```typescript
// ❌ Ruim
errorLogger.error('Erro de login', error, {
  password: user.password,
  creditCard: user.creditCard,
});

// ✅ Bom
errorLogger.error('Erro de login', error, {
  userId: user.id,
  email: user.email,
});
```

---

## 🔍 Monitoramento

### Verificar Logs em Tempo Real

```typescript
// No console do navegador
import { errorLogger } from '@/services/errorLogger';

// Ver todos os logs
console.log(errorLogger.getLogs());

// Ver erros dos últimos 60 minutos
console.log(errorLogger.getRecentLogs(60));

// Ver métricas
console.log(errorLogger.getMetrics());
```

---

## 📤 Integração com Serviços Externos

### Sentry

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});

// Usar errorLogger com Sentry
errorLogger.error('Erro crítico', error, {
  sentryId: Sentry.captureException(error),
});
```

### LogRocket

```typescript
import LogRocket from 'logrocket';

LogRocket.init('YOUR_APP_ID');

// Usar errorLogger com LogRocket
errorLogger.error('Erro crítico', error, {
  logRocketId: LogRocket.getSessionURL(),
});
```

---

## 🚨 Tratamento de Erros Não Capturados

### Erros Globais

```typescript
// Automaticamente registrado
window.addEventListener('error', (event) => {
  // errorLogger.logUncaughtError(event.error)
});

// Promise rejections não capturadas
window.addEventListener('unhandledrejection', (event) => {
  // errorLogger.logUnhandledRejection(event.reason)
});
```

---

## 📊 Análise de Logs

### Filtros Disponíveis

1. **Por Nível**
   - Todos
   - Erro
   - Aviso
   - Informação
   - Debug

2. **Por Período**
   - Últimos 15 minutos
   - Última hora
   - Últimas 4 horas
   - Últimas 24 horas
   - Todos

---

## 🎉 Próximas Melhorias

- [ ] Integração com Sentry
- [ ] Integração com LogRocket
- [ ] Dashboard de estatísticas
- [ ] Alertas em tempo real
- [ ] Análise de padrões
- [ ] Sugestões de correção
- [ ] Integração com Slack
- [ ] Relatórios automáticos

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Uso
