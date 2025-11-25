# 🗄️ Setup Supabase - Pixflow Checkout

## Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Preencha os dados:
   - **Name**: pixflow-checkout
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha a mais próxima (São Paulo: sa-east-1)
4. Clique em "Create new project"
5. Aguarde o projeto ser criado (5-10 minutos)

---

## Passo 2: Obter Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

3. Cole em `.env.production`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## Passo 3: Executar Script SQL

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo de `supabase/migrations/001_create_tables.sql`
4. Clique em **Run**
5. Aguarde a execução

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Executar migrations
supabase db push
```

---

## Passo 4: Verificar Tabelas

1. Vá em **Table Editor**
2. Você deve ver:
   - ✅ payments
   - ✅ customers
   - ✅ campaigns
   - ✅ automations
   - ✅ webhooks
   - ✅ webhook_logs
   - ✅ email_logs
   - ✅ whatsapp_logs
   - ✅ deliverables

---

## Passo 5: Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Ative:
   - ✅ Email (já vem ativado)
   - ✅ Google (opcional)
   - ✅ GitHub (opcional)

3. Vá em **URL Configuration**
4. Adicione sua URL de produção:
   ```
   https://seu-dominio.com
   ```

---

## Passo 6: Configurar Políticas de Segurança (RLS)

### Habilitar RLS

1. Vá em **Authentication** → **Policies**
2. Para cada tabela, clique em **Enable RLS**

### Criar Políticas

```sql
-- Permitir leitura de payments para usuários autenticados
CREATE POLICY "Users can read own payments"
ON payments FOR SELECT
USING (auth.uid() = (SELECT id FROM customers WHERE email = payments.customer_email LIMIT 1));

-- Permitir leitura de customers para usuários autenticados
CREATE POLICY "Users can read customers"
ON customers FOR SELECT
USING (auth.role() = 'authenticated');

-- Permitir escrita em customers para usuários autenticados
CREATE POLICY "Users can update customers"
ON customers FOR UPDATE
USING (auth.role() = 'authenticated');
```

---

## Passo 7: Testar Conexão

```bash
# Testar no seu projeto
npm run dev

# Ir para http://localhost:8080/dashboard
# Se conseguir fazer login, está funcionando!
```

---

## Passo 8: Backup Automático

1. Vá em **Settings** → **Backups**
2. Ative **Automated backups**
3. Escolha frequência: **Daily**

---

## Troubleshooting

### Erro: "Connection refused"

- Verificar se `VITE_SUPABASE_URL` está correto
- Verificar se `VITE_SUPABASE_ANON_KEY` está correto

### Erro: "Permission denied"

- Verificar RLS policies
- Verificar se usuário está autenticado

### Erro: "Table does not exist"

- Executar novamente o script SQL
- Verificar se todas as tabelas foram criadas

---

## 📊 Dados de Teste

Para testar, você pode inserir dados:

```sql
-- Inserir cliente de teste
INSERT INTO customers (email, name, phone, cpf, status)
VALUES ('teste@exemplo.com', 'João Silva', '11999999999', '12345678901', 'novo');

-- Inserir pagamento de teste
INSERT INTO payments (customer_name, customer_email, customer_phone, amount, status)
VALUES ('João Silva', 'teste@exemplo.com', '11999999999', 99.90, 'paid');

-- Inserir campanha de teste
INSERT INTO campaigns (name, subject, content, target_segment, status)
VALUES ('Campanha Teste', 'Assunto Teste', 'Conteúdo Teste', 'todos', 'draft');
```

---

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas para `.env.production`
- [ ] Script SQL executado
- [ ] Todas as tabelas criadas
- [ ] Autenticação configurada
- [ ] RLS habilitado
- [ ] Backup automático ativado
- [ ] Conexão testada

---

**Pronto! Seu banco de dados está configurado! 🎉**
