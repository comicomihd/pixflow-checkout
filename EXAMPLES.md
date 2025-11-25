# 📚 Exemplos de Uso - Protected Routes

## Exemplo 1: Componente com Autenticação

### Usar useAuthContext para acessar dados do usuário

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const UserProfile = () => {
  const { user, isLoading, signOut } = useAuthContext();

  if (isLoading) {
    return <div className="p-4">Carregando perfil...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1>Meu Perfil</h1>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
      <Button onClick={signOut} variant="destructive">
        Sair
      </Button>
    </div>
  );
};

export default UserProfile;
```

---

## Exemplo 2: Componente com Verificação de Autenticação

### Mostrar conteúdo diferente baseado em autenticação

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuthContext();

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1>Minha App</h1>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span>Bem-vindo, {user?.email}</span>
          <Button onClick={signOut} variant="outline">
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={() => window.location.href = "/auth"}>
          Login
        </Button>
      )}
    </header>
  );
};

export default Header;
```

---

## Exemplo 3: Adicionar Nova Rota Protegida

### Passo a passo para adicionar uma nova rota protegida

**1. Criar o componente:**
```tsx
// src/pages/Settings.tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-8">
      <h1>Configurações</h1>
      <p>Usuário: {user?.email}</p>
    </div>
  );
};

export default Settings;
```

**2. Importar em App.tsx:**
```tsx
import Settings from "./pages/Settings";
```

**3. Adicionar rota protegida:**
```tsx
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>
```

---

## Exemplo 4: Hook useAuth (Alternativa)

### Usar useAuth em vez de useAuthContext

```tsx
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
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

export default Dashboard;
```

---

## Exemplo 5: Tratamento de Erros

### Lidar com erros de autenticação

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Sair
    </Button>
  );
};

export default LogoutButton;
```

---

## Exemplo 6: Componente Condicional

### Renderizar componentes diferentes baseado em autenticação

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <div className="p-8">
      {isAuthenticated ? (
        <Card className="p-6">
          <h2>Bem-vindo de volta!</h2>
          <p>Email: {user?.email}</p>
          <p>Você tem acesso a todos os recursos premium.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <h2>Bem-vindo!</h2>
          <p>Faça login para acessar seus recursos.</p>
          <Button onClick={() => window.location.href = "/auth"}>
            Fazer Login
          </Button>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
```

---

## Exemplo 7: Redirecionar Após Logout

### Redirecionar para home após logout

```tsx
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const LogoutWithRedirect = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Sair
    </Button>
  );
};

export default LogoutWithRedirect;
```

---

## Exemplo 8: Verificar Autenticação Antes de Ação

### Executar ação apenas se autenticado

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProtectedAction = () => {
  const { isAuthenticated } = useAuthContext();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado!");
      return;
    }

    // Executar ação protegida
    toast.success("Ação executada!");
  };

  return (
    <Button onClick={handleClick}>
      Executar Ação
    </Button>
  );
};

export default ProtectedAction;
```

---

## Exemplo 9: Componente com Loading

### Mostrar loading enquanto verifica autenticação

```tsx
import { useAuthContext } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const DataDisplay = () => {
  const { isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div>
      <p>Usuário: {user?.email}</p>
    </div>
  );
};

export default DataDisplay;
```

---

## Exemplo 10: Múltiplas Rotas Protegidas

### Estrutura completa com várias rotas protegidas

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";

// Páginas protegidas
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Products from "./pages/Products";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
```

---

## Checklist de Implementação

- [x] ProtectedRoute criado
- [x] useAuth hook criado
- [x] AuthContext criado
- [x] App.tsx atualizado com rotas protegidas
- [x] Dashboard atualizado para usar contexto
- [x] Auth atualizado para usar contexto
- [x] Documentação criada
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Deploy em produção

---

## Troubleshooting

### Erro: "useAuthContext deve ser usado dentro de AuthProvider"
**Solução:** Certifique-se de que o componente está dentro de `<AuthProvider>`

### Erro: Usuário é redirecionado para /auth mesmo autenticado
**Solução:** Verifique se `.env` tem as credenciais corretas do Supabase

### Problema: Loading infinito
**Solução:** Verifique a conexão com Supabase no console do navegador

---

## Recursos Adicionais

- [Documentação React Router](https://reactrouter.com/)
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentação React Context](https://react.dev/reference/react/useContext)
