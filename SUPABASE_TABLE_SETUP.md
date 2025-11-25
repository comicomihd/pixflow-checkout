# 📋 Setup da Tabela PIX_PAYMENTS no Supabase

## ❌ PROBLEMA

A tabela `pix_payments` não existe no seu banco Supabase, causando erro:
```
ERROR: relation "public.pix_payments" does not exist
```

---

## ✅ SOLUÇÃO (Passo a Passo)

### **PASSO 1: Acessar SQL Editor do Supabase**

1. Vá para: https://app.supabase.com
2. Selecione seu projeto
3. Clique em **SQL Editor** (lado esquerdo)
4. Clique em **New Query**

---

### **PASSO 2: Copiar e Executar o Script**

Copie o conteúdo de `supabase/create-pix-payments-final.sql` e cole no SQL Editor.

**OU** execute este script direto:

```sql
-- ============================================
-- CRIAR TABELA PIX_PAYMENTS (FINAL)
-- ============================================

-- 1. Deletar tabela antiga se existir
DROP TABLE IF EXISTS public.pix_payments CASCADE;

-- 2. Criar tabela nova com schema completo
CREATE TABLE public.pix_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Referências
  checkout_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do cliente
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text,
  customer_whatsapp text,
  customer_data jsonb,
  
  -- Valores
  amount numeric(10, 2) NOT NULL,
  bump_amount numeric(10, 2) DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  
  -- Status PIX
  status text DEFAULT 'pending', -- pending, paid, expired, failed
  txid text UNIQUE,
  loc_id integer,
  pix_copy_paste text,
  pix_qr_code text,
  
  -- Timestamps
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Desabilitar RLS (acesso público)
ALTER TABLE public.pix_payments DISABLE ROW LEVEL SECURITY;

-- 4. Criar índices para performance
CREATE INDEX idx_pix_payments_checkout_id ON public.pix_payments(checkout_id);
CREATE INDEX idx_pix_payments_customer_email ON public.pix_payments(customer_email);
CREATE INDEX idx_pix_payments_status ON public.pix_payments(status);
CREATE INDEX idx_pix_payments_txid ON public.pix_payments(txid);
CREATE INDEX idx_pix_payments_user_id ON public.pix_payments(user_id);
CREATE INDEX idx_pix_payments_created_at ON public.pix_payments(created_at DESC);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS handle_pix_payments_updated_at ON public.pix_payments;
CREATE TRIGGER handle_pix_payments_updated_at
BEFORE UPDATE ON public.pix_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. Verificação final
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'pix_payments';

-- 8. Listar colunas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pix_payments'
ORDER BY ordinal_position;
```

---

### **PASSO 3: Executar o Script**

1. Cole o SQL no editor
2. Clique em **Run** (ou `Ctrl+Enter`)
3. Aguarde a execução

**Resultado esperado:**
```
Query executed successfully
```

---

### **PASSO 4: Verificar se a Tabela foi Criada**

1. Vá em **Table Editor** (lado esquerdo)
2. Procure por `pix_payments` na lista
3. Clique nela para ver as colunas

**Você deve ver:**
- ✅ `id` (uuid)
- ✅ `checkout_id` (uuid)
- ✅ `customer_name` (text)
- ✅ `customer_email` (text)
- ✅ `amount` (numeric)
- ✅ `total_amount` (numeric)
- ✅ `status` (text)
- ✅ `txid` (text)
- ✅ `pix_copy_paste` (text)
- ✅ `pix_qr_code` (text)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

---

### **PASSO 5: Atualizar Schema Cache (se necessário)**

Se a tabela não aparecer no Table Editor:

1. Vá em **Table Editor**
2. Clique no ícone de **Refresh** (canto superior direito)
3. Aguarde alguns segundos

---

## 🧪 Teste Rápido

Execute esta query para confirmar:

```sql
INSERT INTO public.pix_payments (
  checkout_id,
  customer_name,
  customer_email,
  amount,
  total_amount,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Teste',
  'teste@example.com',
  29.90,
  29.90,
  'pending'
);

SELECT * FROM public.pix_payments LIMIT 1;
```

**Resultado esperado:** Uma linha inserida com sucesso ✅

---

## 🚀 Próximos Passos

Após criar a tabela:

1. ✅ Tabela criada
2. ⏳ Testar frontend (http://localhost:5173/c/homologacao-pix)
3. ⏳ Verificar se PIX é gerado
4. ⏳ Deploy no Vercel

---

## 📞 Troubleshooting

**Erro: "relation already exists"**
- A tabela já existe. Execute apenas a verificação (PASSO 7-8).

**Erro: "permission denied"**
- Você precisa de permissões de admin no Supabase.

**Tabela não aparece no Table Editor**
- Clique em Refresh (ícone no canto superior direito).
- Aguarde 10 segundos.

---

**Pronto! A tabela está criada e seu PIX vai funcionar! 🎉**
