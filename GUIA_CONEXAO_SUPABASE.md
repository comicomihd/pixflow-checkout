# 🔌 GUIA DE CONEXÃO COM SUPABASE

## 📋 PASSO A PASSO COMPLETO

---

## PASSO 1: CRIAR CONTA NO SUPABASE

### 1.1 Acessar o site
```
URL: https://supabase.com
```

### 1.2 Clicar em "Sign Up"
```
Opções:
- Email + Senha
- GitHub
- Google
```

### 1.3 Confirmar Email
```
Supabase envia email de confirmação
Clique no link para confirmar
```

---

## PASSO 2: CRIAR PROJETO

### 2.1 Clicar em "New Project"
```
Dashboard → New Project
```

### 2.2 Preencher Informações
```
Nome do Projeto: pixflow-checkout
Banco de Dados: PostgreSQL
Região: us-east-1 (ou próxima a você)
Senha: Gere uma senha forte
```

### 2.3 Aguardar Criação
```
Supabase cria o projeto (2-3 minutos)
Você receberá um email de confirmação
```

---

## PASSO 3: OBTER CREDENCIAIS

### 3.1 Acessar Configurações
```
Projeto → Settings → API
```

### 3.2 Copiar Credenciais
```
URL do Projeto (VITE_SUPABASE_URL)
Exemplo: https://xxxxx.supabase.co

Chave Anon (VITE_SUPABASE_ANON_KEY)
Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Guardar em Local Seguro
```
Não compartilhe essas credenciais
Não faça commit no git
```

---

## PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 4.1 Criar Arquivo .env
```bash
# Na raiz do projeto
touch .env
```

### 4.2 Preencher .env
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 Salvar Arquivo
```bash
# Não adicione ao git
# .gitignore já deve ter .env
```

---

## PASSO 5: INSTALAR DEPENDÊNCIAS

### 5.1 Instalar Supabase Client
```bash
npm install @supabase/supabase-js
```

### 5.2 Instalar Outras Dependências
```bash
npm install
```

---

## PASSO 6: CRIAR CLIENTE SUPABASE

### 6.1 Arquivo já existe
```
src/integrations/supabase/client.ts
```

### 6.2 Verificar Conteúdo
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## PASSO 7: CRIAR TABELAS NO BANCO

### 7.1 Acessar SQL Editor
```
Projeto → SQL Editor
```

### 7.2 Criar Tabela de Produtos
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
```

### 7.3 Criar Tabela de Checkouts
```sql
CREATE TABLE checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  theme_color VARCHAR(7) DEFAULT '#000000',
  countdown_minutes INT DEFAULT 30,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX idx_checkouts_product_id ON checkouts(product_id);
```

### 7.4 Criar Tabela de Pagamentos
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  pix_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_checkout_id ON payments(checkout_id);
```

### 7.5 Criar Tabela de Entregas
```sql
CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  product_id UUID NOT NULL REFERENCES products(id),
  status VARCHAR(50) DEFAULT 'pending',
  delivery_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_logs_payment_id ON delivery_logs(payment_id);
```

### 7.6 Criar Tabela de Webhooks
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
```

### 7.7 Criar Tabela de Logs de Webhooks
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id),
  event_type VARCHAR(100) NOT NULL,
  status_code INT,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
```

---

## PASSO 8: CONFIGURAR AUTENTICAÇÃO

### 8.1 Acessar Auth Settings
```
Projeto → Authentication → Providers
```

### 8.2 Ativar Email/Password
```
Email → Enable
```

### 8.3 Configurar URL de Redirecionamento
```
Projeto → Authentication → URL Configuration

Site URL: http://localhost:5173 (desenvolvimento)
Redirect URLs: http://localhost:5173/auth/callback
```

### 8.4 Para Produção
```
Site URL: https://seu-dominio.com
Redirect URLs: https://seu-dominio.com/auth/callback
```

---

## PASSO 9: CONFIGURAR STORAGE

### 9.1 Acessar Storage
```
Projeto → Storage
```

### 9.2 Criar Bucket para Deliveries
```
Nome: deliveries
Privacidade: Private (requer autenticação)
```

### 9.3 Criar Bucket para Imagens
```
Nome: images
Privacidade: Public (sem autenticação)
```

---

## PASSO 10: EXECUTAR PROJETO

### 10.1 Instalar Dependências
```bash
npm install
```

### 10.2 Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

### 10.3 Acessar no Navegador
```
URL: http://localhost:5173
```

### 10.4 Testar Login
```
1. Clique em "Sign Up"
2. Preencha email e senha
3. Confirme email
4. Faça login
5. Acesse dashboard
```

---

## 🔧 COMANDOS ÚTEIS

### Instalar Dependências
```bash
npm install
```

### Iniciar Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview de Produção
```bash
npm run preview
```

### Executar Testes
```bash
npm run test
```

### Executar Testes E2E
```bash
npm run e2e
```

### Linter
```bash
npm run lint
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@supabase/supabase-js'"
```bash
# Solução:
npm install @supabase/supabase-js
```

### Erro: "VITE_SUPABASE_URL is not defined"
```bash
# Solução:
1. Verifique se .env existe
2. Verifique se as variáveis estão preenchidas
3. Reinicie o servidor (npm run dev)
```

### Erro: "Invalid login credentials"
```bash
# Solução:
1. Verifique se o email está confirmado
2. Verifique se a senha está correta
3. Tente fazer signup novamente
```

### Erro: "Row-level security (RLS) policy violation"
```bash
# Solução:
1. Acesse Projeto → Authentication → Policies
2. Crie policies para suas tabelas
3. Exemplo:
   - SELECT: (auth.uid() = user_id)
   - INSERT: (auth.uid() = user_id)
   - UPDATE: (auth.uid() = user_id)
   - DELETE: (auth.uid() = user_id)
```

### Erro: "Storage bucket not found"
```bash
# Solução:
1. Acesse Projeto → Storage
2. Crie o bucket "deliveries"
3. Configure permissões
```

---

## 📝 EXEMPLO COMPLETO DE USO

### Fazer Login
```typescript
import { supabase } from '@/integrations/supabase/client';

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erro ao fazer login:', error.message);
    return;
  }

  console.log('Login realizado:', data.user);
};
```

### Fazer Signup
```typescript
const handleSignup = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Erro ao fazer signup:', error.message);
    return;
  }

  console.log('Signup realizado:', data.user);
};
```

### Buscar Dados
```typescript
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao buscar produtos:', error.message);
    return;
  }

  console.log('Produtos:', data);
};
```

### Inserir Dados
```typescript
const createProduct = async (name: string, price: number) => {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        user_id: userId,
        name,
        price,
      },
    ]);

  if (error) {
    console.error('Erro ao criar produto:', error.message);
    return;
  }

  console.log('Produto criado:', data);
};
```

### Atualizar Dados
```typescript
const updateProduct = async (id: string, name: string, price: number) => {
  const { data, error } = await supabase
    .from('products')
    .update({ name, price })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar produto:', error.message);
    return;
  }

  console.log('Produto atualizado:', data);
};
```

### Deletar Dados
```typescript
const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar produto:', error.message);
    return;
  }

  console.log('Produto deletado');
};
```

### Upload de Arquivo
```typescript
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('Erro ao fazer upload:', error.message);
    return;
  }

  console.log('Arquivo enviado:', data);
};
```

### Download de Arquivo
```typescript
const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    console.error('Erro ao fazer download:', error.message);
    return;
  }

  console.log('Arquivo baixado:', data);
};
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] Criar conta no Supabase
- [ ] Criar projeto
- [ ] Copiar credenciais
- [ ] Criar arquivo .env
- [ ] Preencher variáveis de ambiente
- [ ] Instalar dependências
- [ ] Criar tabelas no banco
- [ ] Configurar autenticação
- [ ] Configurar storage
- [ ] Testar login/signup
- [ ] Testar CRUD de produtos
- [ ] Testar upload de arquivo

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Configurar Supabase
2. ✅ Criar tabelas
3. ✅ Testar autenticação
4. ✅ Testar CRUD
5. ✅ Testar upload
6. ✅ Testar webhooks
7. ✅ Deploy em produção

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Usar
