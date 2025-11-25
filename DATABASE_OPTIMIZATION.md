# 🚀 Otimização de Queries e Índices - Pixflow Checkout

## 📋 Visão Geral

Este documento descreve as otimizações de banco de dados implementadas para melhorar performance.

---

## 🗂️ Estrutura de Tabelas

### 1. **users** (Supabase Auth)
```sql
-- Tabela gerenciada pelo Supabase Auth
-- Não requer índices adicionais
```

### 2. **checkouts**
```sql
CREATE TABLE checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  theme_color VARCHAR(7),
  countdown_minutes INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX idx_checkouts_slug ON checkouts(slug);
CREATE INDEX idx_checkouts_active ON checkouts(active);
CREATE INDEX idx_checkouts_user_active ON checkouts(user_id, active);
```

### 3. **products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_user_active ON products(user_id, active);
```

### 4. **checkout_products**
```sql
CREATE TABLE checkout_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_position INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_checkout_products_checkout_id ON checkout_products(checkout_id);
CREATE INDEX idx_checkout_products_product_id ON checkout_products(product_id);
CREATE INDEX idx_checkout_products_checkout_product ON checkout_products(checkout_id, product_id);
```

### 5. **payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  bump_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  pix_key VARCHAR(255),
  pix_qr_code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_payments_checkout_id ON payments(checkout_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_checkout_status ON payments(checkout_id, status);
CREATE INDEX idx_payments_customer_email ON payments(customer_email);
```

### 6. **upsells**
```sql
CREATE TABLE upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_upsells_checkout_id ON upsells(checkout_id);
CREATE INDEX idx_upsells_active ON upsells(active);
CREATE INDEX idx_upsells_checkout_active ON upsells(checkout_id, active);
```

### 7. **downsells**
```sql
CREATE TABLE downsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_downsells_checkout_id ON downsells(checkout_id);
CREATE INDEX idx_downsells_active ON downsells(active);
CREATE INDEX idx_downsells_checkout_active ON downsells(checkout_id, active);
```

### 8. **presells**
```sql
CREATE TABLE presells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  headline VARCHAR(500) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  bullet_points JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_presells_checkout_id ON presells(checkout_id);
CREATE INDEX idx_presells_active ON presells(active);
CREATE INDEX idx_presells_checkout_active ON presells(checkout_id, active);
```

### 9. **delivery_logs**
```sql
CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices Recomendados
CREATE INDEX idx_delivery_logs_payment_id ON delivery_logs(payment_id);
CREATE INDEX idx_delivery_logs_product_id ON delivery_logs(product_id);
CREATE INDEX idx_delivery_logs_status ON delivery_logs(status);
CREATE INDEX idx_delivery_logs_payment_status ON delivery_logs(payment_id, status);
```

---

## 📊 Script de Criação de Índices

Execute este script no Supabase SQL Editor:

```sql
-- Índices para checkouts
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_slug ON checkouts(slug);
CREATE INDEX IF NOT EXISTS idx_checkouts_active ON checkouts(active);
CREATE INDEX IF NOT EXISTS idx_checkouts_user_active ON checkouts(user_id, active);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_user_active ON products(user_id, active);

-- Índices para checkout_products
CREATE INDEX IF NOT EXISTS idx_checkout_products_checkout_id ON checkout_products(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_products_product_id ON checkout_products(product_id);
CREATE INDEX IF NOT EXISTS idx_checkout_products_checkout_product ON checkout_products(checkout_id, product_id);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_status ON payments(checkout_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Índices para upsells
CREATE INDEX IF NOT EXISTS idx_upsells_checkout_id ON upsells(checkout_id);
CREATE INDEX IF NOT EXISTS idx_upsells_active ON upsells(active);
CREATE INDEX IF NOT EXISTS idx_upsells_checkout_active ON upsells(checkout_id, active);

-- Índices para downsells
CREATE INDEX IF NOT EXISTS idx_downsells_checkout_id ON downsells(checkout_id);
CREATE INDEX IF NOT EXISTS idx_downsells_active ON downsells(active);
CREATE INDEX IF NOT EXISTS idx_downsells_checkout_active ON downsells(checkout_id, active);

-- Índices para presells
CREATE INDEX IF NOT EXISTS idx_presells_checkout_id ON presells(checkout_id);
CREATE INDEX IF NOT EXISTS idx_presells_active ON presells(active);
CREATE INDEX IF NOT EXISTS idx_presells_checkout_active ON presells(checkout_id, active);

-- Índices para delivery_logs
CREATE INDEX IF NOT EXISTS idx_delivery_logs_payment_id ON delivery_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_product_id ON delivery_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_payment_status ON delivery_logs(payment_id, status);
```

---

## 🔍 Queries Otimizadas

### 1. **Buscar Checkouts do Usuário**

❌ **Antes (Sem Índice)**
```typescript
const { data } = await supabase
  .from('checkouts')
  .select('*')
  .eq('user_id', userId);
```

✅ **Depois (Com Índice)**
```typescript
// Mesma query, mas muito mais rápida com índice
const { data } = await supabase
  .from('checkouts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Índice:** `idx_checkouts_user_id`

---

### 2. **Buscar Checkout por Slug**

```typescript
const { data } = await supabase
  .from('checkouts')
  .select('*')
  .eq('slug', slug)
  .single();
```

**Índice:** `idx_checkouts_slug` (UNIQUE)

---

### 3. **Buscar Checkouts Ativos do Usuário**

```typescript
const { data } = await supabase
  .from('checkouts')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true);
```

**Índice:** `idx_checkouts_user_active` (Composite)

---

### 4. **Buscar Pagamentos com Status**

```typescript
const { data } = await supabase
  .from('payments')
  .select('*, checkouts(name)')
  .eq('checkout_id', checkoutId)
  .eq('status', 'paid')
  .order('created_at', { ascending: false });
```

**Índices:** `idx_payments_checkout_status`

---

### 5. **Buscar Produtos Ativos**

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true)
  .order('created_at', { ascending: false });
```

**Índice:** `idx_products_user_active`

---

### 6. **Buscar Upsells Ativos**

```typescript
const { data } = await supabase
  .from('upsells')
  .select('*')
  .eq('checkout_id', checkoutId)
  .eq('active', true)
  .limit(1);
```

**Índice:** `idx_upsells_checkout_active`

---

### 7. **Buscar Histórico de Vendas**

```typescript
const { data } = await supabase
  .from('payments')
  .select('*, checkouts(name)')
  .eq('checkout_id', checkoutId)
  .order('created_at', { ascending: false })
  .range(0, 49); // Paginação
```

**Índices:** `idx_payments_checkout_id`, `idx_payments_created_at`

---

### 8. **Buscar Entregas Pendentes**

```typescript
const { data } = await supabase
  .from('delivery_logs')
  .select('*')
  .eq('status', 'pending')
  .order('created_at', { ascending: false });
```

**Índice:** `idx_delivery_logs_status`

---

## 📈 Estratégias de Otimização

### 1. **Índices Simples**
```sql
CREATE INDEX idx_table_column ON table(column);
```
Melhor para: Filtros frequentes em uma coluna

### 2. **Índices Compostos**
```sql
CREATE INDEX idx_table_col1_col2 ON table(col1, col2);
```
Melhor para: Filtros em múltiplas colunas

### 3. **Índices DESC**
```sql
CREATE INDEX idx_table_column_desc ON table(column DESC);
```
Melhor para: Ordenação decrescente

### 4. **Índices Únicos**
```sql
CREATE UNIQUE INDEX idx_table_column ON table(column);
```
Melhor para: Valores únicos (slugs, emails)

---

## ⚡ Otimizações de Query

### 1. **Usar Select Específico**

❌ **Evitar**
```typescript
const { data } = await supabase
  .from('payments')
  .select('*'); // Carrega todas as colunas
```

✅ **Preferir**
```typescript
const { data } = await supabase
  .from('payments')
  .select('id, customer_name, total_amount, status, created_at');
```

### 2. **Usar Limit**

```typescript
const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', userId)
  .limit(50); // Limita resultados
```

### 3. **Usar Paginação**

```typescript
const page = 1;
const pageSize = 50;

const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', userId)
  .range((page - 1) * pageSize, page * pageSize - 1);
```

### 4. **Usar Filtros Antes de Joins**

```typescript
// ✅ Melhor: Filtra antes do join
const { data } = await supabase
  .from('payments')
  .select('*, checkouts(name)')
  .eq('status', 'paid')
  .eq('checkout_id', checkoutId);

// ❌ Evitar: Carrega tudo e filtra depois
const { data: allPayments } = await supabase
  .from('payments')
  .select('*, checkouts(name)');
```

---

## 🔧 Monitoramento de Performance

### Verificar Índices Existentes

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Verificar Tamanho de Índices

```sql
SELECT 
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Verificar Índices Não Utilizados

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 📊 Impacto de Índices

| Operação | Sem Índice | Com Índice | Melhoria |
|----------|-----------|-----------|----------|
| SELECT com filtro | 500ms | 5ms | 100x |
| INSERT | 10ms | 15ms | -50% |
| UPDATE | 20ms | 25ms | -25% |
| DELETE | 30ms | 35ms | -17% |

**Nota:** Índices melhoram leitura mas aumentam escrita

---

## 🎯 Checklist de Otimização

- [x] Criar índices em foreign keys
- [x] Criar índices em colunas de filtro
- [x] Criar índices compostos para queries comuns
- [x] Criar índices em colunas de ordenação
- [x] Usar UNIQUE para slugs/emails
- [x] Documentar índices
- [ ] Monitorar performance
- [ ] Remover índices não utilizados
- [ ] Analisar query plans
- [ ] Otimizar queries lentas

---

## 📝 Próximas Melhorias

- [ ] Implementar caching com Redis
- [ ] Adicionar materialized views
- [ ] Implementar particionamento de tabelas
- [ ] Adicionar full-text search
- [ ] Otimizar JOINs complexos
- [ ] Implementar query result caching

---

## 📞 Suporte

Para verificar performance:
1. Use Supabase Dashboard > Database > Indexes
2. Execute queries de monitoramento acima
3. Analise query plans com EXPLAIN ANALYZE

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Implementação
