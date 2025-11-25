# 🔧 CORRIGIR TABELA PIX_PAYMENTS - REST API

## ❌ PROBLEMA

Supabase REST API não reconhece a tabela `pix_payments`:
- Tabela existe no banco
- Mas não aparece no Table Editor
- Ou aparece vazia (sem colunas)
- Erro: `"public.pix_payments" does not exist`

---

## ✅ SOLUÇÃO (Garantida)

### PASSO 1: Executar Script de Correção

1. Vá para: https://app.supabase.com
2. SQL Editor → New Query
3. Cole o conteúdo de: `supabase/fix-pix-payments-rest.sql`
4. Clique em **Run**

**Resultado esperado:**
```
Query executed successfully
```

---

### PASSO 2: Aguardar 30 Segundos

O Supabase precisa recarregar o schema interno.

---

### PASSO 3: Refresh no Table Editor

1. Vá em **Table Editor**
2. Clique no ícone de **Refresh** (canto superior direito)
3. Aguarde 10 segundos

---

### PASSO 4: Verificar se Tabela Aparece

**Você deve ver:**
- ✅ `pix_payments` na lista de tabelas
- ✅ Todas as colunas listadas
- ✅ Status: "Unrestricted" (RLS desabilitado)

---

### PASSO 5: Testar INSERT via Table Editor

1. Clique em `pix_payments`
2. Clique em **Insert Row**
3. Preencha:
   - `checkout_id`: qualquer UUID
   - `customer_name`: "Teste"
   - `customer_email`: "teste@example.com"
   - `amount`: 29.90
   - `total_amount`: 29.90
   - `status`: "pending"
4. Clique em **Save**

**Resultado esperado:** Linha inserida com sucesso ✅

---

## 🧪 TESTE VIA SQL

Execute esta query para confirmar:

```sql
SELECT COUNT(*) as total FROM public.pix_payments;
```

**Resultado esperado:** `total: 1` (ou mais se houver dados)

---

## 🔍 TROUBLESHOOTING

### ❌ Erro: "permission denied"

**Solução:**
1. Vá em **Settings** → **Database**
2. Verifique se você tem permissões de admin
3. Se não, peça para o admin executar o script

### ❌ Tabela ainda não aparece

**Solução:**
1. Feche o navegador completamente
2. Abra novamente: https://app.supabase.com
3. Vá em Table Editor
4. Clique em Refresh

### ❌ Erro: "table already exists"

**Solução:**
1. A tabela já foi criada
2. Execute apenas o TESTE (PASSO 5)
3. Se funcionar, está tudo ok

### ❌ Colunas não aparecem

**Solução:**
1. Execute o script novamente
2. Aguarde 1 minuto
3. Refresh no Table Editor

---

## ✨ DEPOIS DE CORRIGIR

Seu frontend vai funcionar! 🚀

```javascript
// Isso vai funcionar agora:
const { data } = await supabase
  .from('pix_payments')
  .insert({ ... })
  .select();
```

---

## 📞 SE AINDA NÃO FUNCIONAR

Execute este script de diagnóstico:

```sql
-- Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pix_payments'
) as tabela_existe;

-- Verificar RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pix_payments';

-- Verificar PRIMARY KEY
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
AND table_name = 'pix_payments'
AND constraint_type = 'PRIMARY KEY';

-- Contar colunas
SELECT COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pix_payments';
```

Se tudo retornar OK, a tabela está pronta! ✅

---

**Pronto! Agora o Supabase vai reconhecer a tabela! 🎉**
