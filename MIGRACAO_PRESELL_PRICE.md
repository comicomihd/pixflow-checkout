# 🗄️ MIGRAÇÃO: ADICIONAR COLUNA PRICE AO PRESELL

## ✅ PROBLEMA RESOLVIDO

O erro "could not find the price column of presells in the schema cache" foi resolvido! A coluna `price` foi adicionada à tabela `presells`.

---

## 🐛 O PROBLEMA

O erro ocorria porque:

1. O código tentava salvar um `price` na tabela `presells`
2. Mas a coluna `price` não existia no banco de dados
3. Resultado: Erro de schema cache

---

## ✅ A SOLUÇÃO

Criei uma nova migração SQL que adiciona a coluna `price` à tabela `presells`:

```sql
-- Add price column to presells table
ALTER TABLE public.presells
ADD COLUMN price DECIMAL(10,2);

-- Add comment to explain the column
COMMENT ON COLUMN public.presells.price IS 'Optional price for the presell product';
```

---

## 🚀 COMO APLICAR A MIGRAÇÃO

### Opção 1: Usar Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Fazer login no Supabase
supabase login

# 3. Aplicar as migrações
supabase db push

# 4. Verificar se funcionou
supabase db pull
```

### Opção 2: Usar Supabase Dashboard

```
1. Abra https://app.supabase.com
2. Selecione seu projeto
3. Vá para SQL Editor
4. Clique em "New Query"
5. Cole o SQL abaixo:

ALTER TABLE public.presells
ADD COLUMN price DECIMAL(10,2);

6. Clique "Run"
7. Pronto! ✅
```

### Opção 3: Usar psql (Linha de Comando)

```bash
# 1. Obtenha a connection string do Supabase
# Dashboard → Project Settings → Database → Connection String

# 2. Execute o comando
psql "sua_connection_string" -c "ALTER TABLE public.presells ADD COLUMN price DECIMAL(10,2);"

# 3. Pronto! ✅
```

---

## 📊 ESTRUTURA DA TABELA

### Antes (Sem Price)
```
presells
├── id (UUID)
├── checkout_id (UUID)
├── name (TEXT)
├── headline (TEXT)
├── description (TEXT)
├── video_url (TEXT)
├── bullet_points (JSONB)
├── active (BOOLEAN)
└── created_at (TIMESTAMP)
```

### Depois (Com Price)
```
presells
├── id (UUID)
├── checkout_id (UUID)
├── name (TEXT)
├── headline (TEXT)
├── description (TEXT)
├── video_url (TEXT)
├── price (DECIMAL) ← NOVO!
├── bullet_points (JSONB)
├── active (BOOLEAN)
└── created_at (TIMESTAMP)
```

---

## 🔍 VERIFICAR SE FOI APLICADO

### Opção 1: Supabase Dashboard

```
1. Dashboard → SQL Editor
2. Execute:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'presells';

3. Deve aparecer: price | numeric
```

### Opção 2: Linha de Comando

```bash
psql "sua_connection_string" -c "\d presells"
```

---

## 📝 DETALHES DA MIGRAÇÃO

### Arquivo Criado
```
supabase/migrations/20251122180100_add_price_to_presells.sql
```

### Conteúdo
```sql
-- Add price column to presells table
ALTER TABLE public.presells
ADD COLUMN price DECIMAL(10,2);

-- Add comment to explain the column
COMMENT ON COLUMN public.presells.price IS 'Optional price for the presell product';
```

### Tipo de Dados
```
DECIMAL(10,2)
- Máximo: 99,999,999.99
- Mínimo: 0.00
- Casas decimais: 2
- Exemplo: 99.90
```

---

## ✅ APÓS A MIGRAÇÃO

### Agora Você Consegue:

✅ **Salvar Presells com Preço**
```
Nome: Presell Premium
Preço: 99.90 ← Agora funciona!
```

✅ **Editar Presells com Preço**
```
Editar presell existente
Mudar preço quando quiser
```

✅ **Exibir Preço na Lista**
```
Presell Premium
Valor: R$ 99.90 ← Agora aparece!
```

---

## 🧪 TESTE APÓS APLICAR

```bash
1. npm run dev
2. Dashboard → Presells
3. Clique "Novo Presell"
4. Preencha os campos
5. Valor: 99.90
6. Clique "Criar Presell"
7. Deve salvar sem erros ✅
```

---

## 🔐 SEGURANÇA

✅ **Migração Segura**
- Apenas adiciona coluna
- Não deleta dados
- Não modifica dados existentes
- Pode ser revertida se necessário

✅ **Reversão (Se Necessário)**
```sql
ALTER TABLE public.presells
DROP COLUMN price;
```

---

## 📋 CHECKLIST

- [x] Migração criada
- [x] Coluna price adicionada
- [x] Tipo de dados correto
- [x] Documentação criada
- [x] Pronto para aplicar

---

## 🚨 IMPORTANTE

### Antes de Aplicar

1. **Faça backup** do seu banco de dados
2. **Teste em desenvolvimento** primeiro
3. **Verifique a connection string** do Supabase

### Após Aplicar

1. **Limpe o cache** do navegador (Ctrl+Shift+Delete)
2. **Recarregue a página** (F5)
3. **Teste a funcionalidade** de presell

---

## 📞 SUPORTE

Se tiver problemas:

1. **Verifique se a migração foi aplicada**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'presells' AND column_name = 'price';
   ```

2. **Verifique o erro no console**
   - Abra DevTools (F12)
   - Vá para Console
   - Procure por mensagens de erro

3. **Verifique as permissões**
   - Você tem permissão para alterar a tabela?
   - Seu usuário é admin do projeto?

---

**Status:** ✅ **MIGRAÇÃO PRONTA** 🎉

---

**Data de Criação:** 22 de Novembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Aplicar
