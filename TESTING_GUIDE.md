# 🧪 Guia de Testes - Pixflow Checkout

## 📋 Visão Geral

Este projeto inclui uma estrutura completa de testes com:
- **Unit Tests** - Vitest + React Testing Library
- **E2E Tests** - Playwright
- **Coverage Reports** - Cobertura de código

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install
```

As dependências de teste já estão no `package.json`:
- `vitest` - Framework de testes
- `@testing-library/react` - Utilitários para testes React
- `@playwright/test` - Testes E2E
- `jsdom` - Ambiente DOM para testes

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.test
cp .env .env.test
```

---

## 🧪 Unit Tests

### Executar Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (reexecuta ao salvar)
npm run test -- --watch

# Com UI interativa
npm run test:ui

# Com cobertura de código
npm run test:coverage
```

### Estrutura de Testes

```
src/test/
├── setup.ts                    # Configuração global
├── hooks/
│   └── useAuth.test.ts        # Testes do hook useAuth
└── components/
    └── ProtectedRoute.test.tsx # Testes do componente ProtectedRoute
```

### Exemplo de Teste Unitário

```typescript
// src/test/hooks/useAuth.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

### Testes Implementados

#### 1. **useAuth Hook Tests**
- ✅ Inicialização com estado de loading
- ✅ Retorna usuário quando autenticado
- ✅ Retorna null quando não autenticado
- ✅ Fornece função signOut

#### 2. **ProtectedRoute Component Tests**
- ✅ Mostra loading state inicialmente
- ✅ Renderiza children quando autenticado
- ✅ Redireciona para /auth quando não autenticado

---

## 🎭 E2E Tests

### Executar Testes E2E

```bash
# Executar todos os testes E2E
npm run e2e

# Modo UI interativo
npm run e2e:ui

# Modo debug (passo a passo)
npm run e2e:debug

# Executar teste específico
npm run e2e -- auth.spec.ts

# Executar em navegador específico
npm run e2e -- --project=chromium
```

### Estrutura de Testes E2E

```
e2e/
├── auth.spec.ts          # Testes de autenticação
├── dashboard.spec.ts     # Testes do dashboard
└── checkout.spec.ts      # Testes de checkout
```

### Testes E2E Implementados

#### 1. **Authentication Flow** (`auth.spec.ts`)
- ✅ Redireciona para /auth ao acessar rota protegida
- ✅ Mostra formulário de login e signup
- ✅ Alterna entre login e signup
- ✅ Mostra erro para credenciais inválidas
- ✅ Redireciona usuários não autenticados
- ✅ Permite acesso a rotas públicas

#### 2. **Dashboard** (`dashboard.spec.ts`)
- ✅ Exibe dashboard com todas as seções
- ✅ Navega para página de produtos
- ✅ Navega para página de checkouts
- ✅ Navega para página de vendas
- ✅ Tem botão de logout
- ✅ Faz logout com sucesso

#### 3. **Checkout Flow** (`checkout.spec.ts`)
- ✅ Carrega página de checkout
- ✅ Mostra landing page
- ✅ Navega para auth a partir da landing page
- ✅ Mostra 404 para checkout não existente
- ✅ Páginas públicas são acessíveis
- ✅ Mostra página de obrigado

---

## 📊 Cobertura de Código

### Gerar Relatório de Cobertura

```bash
npm run test:coverage
```

Abre relatório HTML em `coverage/index.html`

### Metas de Cobertura

| Tipo | Meta |
|------|------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## 🔧 Configuração

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  },
});
```

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
  },
});
```

---

## 📝 Escrevendo Novos Testes

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    
    // Interact with page
    await page.click('button:has-text("Click Me")');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## 🐛 Debugging

### Debug Unit Tests

```bash
# Modo debug com breakpoints
npm run test -- --inspect-brk

# Modo watch com UI
npm run test:ui
```

### Debug E2E Tests

```bash
# Modo debug passo a passo
npm run e2e:debug

# Gera vídeo de falhas
npm run e2e -- --video=on
```

---

## 🚨 Troubleshooting

### Problema: Testes não encontram módulos

**Solução:** Verifique se o alias `@` está configurado em `vitest.config.ts`

### Problema: Testes E2E falham com timeout

**Solução:** Aumente o timeout:
```typescript
test.setTimeout(30000); // 30 segundos
```

### Problema: Mocks não funcionam

**Solução:** Certifique-se de que `vi.clearAllMocks()` está em `beforeEach`

### Problema: localStorage não funciona em testes

**Solução:** Use `context.addInitScript()` em testes E2E:
```typescript
await context.addInitScript(() => {
  localStorage.setItem('key', 'value');
});
```

---

## 📊 Relatórios

### Gerar Relatório HTML

```bash
npm run test:coverage
```

Abre em: `coverage/index.html`

### Visualizar Resultados

```bash
npm run test:ui
```

Abre UI interativa em: `http://localhost:51204/__vitest__/`

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
      - run: npm run e2e
```

---

## 📚 Recursos

### Testing Library
- [React Testing Library Docs](https://testing-library.com/react)
- [Best Practices](https://testing-library.com/docs/queries/about)

### Vitest
- [Vitest Docs](https://vitest.dev/)
- [API Reference](https://vitest.dev/api/)

### Playwright
- [Playwright Docs](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-page)

---

## ✅ Checklist de Testes

- [x] Vitest configurado
- [x] React Testing Library integrada
- [x] Playwright configurado
- [x] Unit tests criados
- [x] E2E tests criados
- [x] Setup de testes configurado
- [x] Mocks implementados
- [x] Documentação criada

---

## 🎯 Próximas Melhorias

- [ ] Aumentar cobertura para 90%
- [ ] Adicionar testes de performance
- [ ] Adicionar testes de acessibilidade
- [ ] Integrar com CI/CD
- [ ] Adicionar testes de snapshot
- [ ] Implementar visual regression tests

---

## 📞 Suporte

Para dúvidas sobre testes:
1. Consulte a documentação oficial
2. Verifique os exemplos em `src/test/` e `e2e/`
3. Execute `npm run test:ui` para debug interativo

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Uso
