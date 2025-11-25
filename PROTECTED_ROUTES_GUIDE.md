# 🔐 Guia de Protected Routes

## Visão Geral

Este projeto implementa um sistema robusto de proteção de rotas autenticadas usando React Router, Supabase Auth e Context API.

## Arquitetura

### 1. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
Componente que envolve rotas protegidas e verifica autenticação antes de renderizar.

**Funcionalidades:**
- Verifica se o usuário está autenticado
- Redireciona para `/auth` se não autenticado
- Mostra loading enquanto verifica autenticação
- Escuta mudanças de estado de autenticação em tempo real

**Uso:**
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 2. **useAuth Hook** (`src/hooks/useAuth.ts`)
Hook customizado para gerenciar estado de autenticação.

**Retorna:**
```typescript
{
  user: User | null,           // Usuário autenticado
  isLoading: boolean,          // Carregando
  isAuthenticated: boolean,    // Está autenticado?
  signOut: () => Promise<void> // Função para logout
}
```

**Uso:**
```tsx
const { user, isLoading, isAuthenticated, signOut } = useAuth();
```

### 3. **AuthContext** (`src/contexts/AuthContext.tsx`)
Context que compartilha estado de autenticação entre componentes.

**Componentes:**
- `AuthProvider`: Wrapper que fornece contexto
- `useAuthContext`: Hook para acessar contexto

**Uso:**
```tsx
// No App.tsx
<AuthProvider>
  <App />
</AuthProvider>

// Em qualquer componente
const { user, isLoading, isAuthenticated, signOut } = useAuthContext();
```

## Fluxo de Autenticação

```
1. Usuário tenta acessar rota protegida
   ↓
2. ProtectedRoute verifica autenticação
   ↓
3. Se não autenticado → Redireciona para /auth
   ↓
4. Se autenticado → Renderiza componente
   ↓
5. Escuta mudanças de estado em tempo real
```

## Rotas Protegidas Atuais

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/dashboard` | Dashboard | Painel principal |
| `/products` | Products | Gerenciamento de produtos |
| `/checkouts` | Checkouts | Gerenciamento de checkouts |
| `/checkouts/:id/edit` | CheckoutEditor | Editor de checkout |
| `/sales` | Sales | Histórico de vendas |
| `/presells` | Presells | Páginas de presell |

## Rotas Públicas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Index | Landing page |
| `/auth` | Auth | Login/Signup |
| `/c/:slug` | Checkout | Página de checkout pública |
| `/upsell` | Upsell | Ofertas pós-compra |
| `/downsell` | Downsell | Ofertas alternativas |
| `/obrigado` | ThankYou | Página de obrigado |

## Como Usar em Componentes

### Opção 1: useAuth Hook (Simples)
```tsx
import { useAuth } from "@/hooks/useAuth";

const MyComponent = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;

  return (
    <div>
      <p>Bem-vindo, {user?.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
};
```

### Opção 2: useAuthContext Hook (Com Provider)
```tsx
import { useAuthContext } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuthContext();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;

  return (
    <div>
      <p>Bem-vindo, {user?.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
};
```

## Adicionando Novas Rotas Protegidas

1. **Importe ProtectedRoute:**
```tsx
import ProtectedRoute from "@/components/ProtectedRoute";
```

2. **Envolva a rota:**
```tsx
<Route
  path="/nova-rota"
  element={
    <ProtectedRoute>
      <NovoComponente />
    </ProtectedRoute>
  }
/>
```

## Tratamento de Erros

### Erro de Autenticação
```tsx
const { user, isLoading, signOut } = useAuthContext();

const handleLogout = async () => {
  try {
    await signOut();
    toast.success("Logout realizado!");
  } catch (error) {
    toast.error("Erro ao fazer logout");
  }
};
```

## Segurança

✅ **Implementado:**
- Verificação de sessão no carregamento
- Redirecionamento automático se não autenticado
- Escuta de mudanças de estado em tempo real
- Logout seguro com Supabase

⚠️ **Considere adicionar:**
- Rate limiting em endpoints
- Refresh token rotation
- CSRF protection
- Audit logging

## Performance

- **Lazy loading**: Rotas são carregadas sob demanda
- **Caching**: Sessão é armazenada em localStorage
- **Otimização**: useAuth usa useEffect para evitar re-renders desnecessários

## Troubleshooting

### Problema: Usuário é redirecionado para /auth mesmo autenticado
**Solução:** Verifique se o Supabase está configurado corretamente em `.env`

### Problema: Loading infinito
**Solução:** Verifique a conexão com Supabase e console para erros

### Problema: Logout não funciona
**Solução:** Verifique se `signOut()` está sendo chamado corretamente

## Próximas Melhorias

- [ ] Adicionar role-based access control (RBAC)
- [ ] Implementar refresh token rotation
- [ ] Adicionar audit logging
- [ ] Implementar 2FA
- [ ] Adicionar session timeout
