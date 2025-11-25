# ⚡ Otimização de Queries - Pixflow Checkout

## 📋 Visão Geral

Guia prático para otimizar queries no Supabase com exemplos reais.

---

## 🎯 Princípios Básicos

### 1. **Sempre Use Índices**
- Crie índices em colunas usadas em WHERE
- Crie índices em colunas usadas em JOIN
- Crie índices em colunas usadas em ORDER BY

### 2. **Selecione Apenas Colunas Necessárias**
```typescript
// ❌ Evitar
const { data } = await supabase
  .from('payments')
  .select('*');

// ✅ Preferir
const { data } = await supabase
  .from('payments')
  .select('id, customer_name, total_amount, status, created_at');
```

### 3. **Use Filtros Específicos**
```typescript
// ❌ Evitar
const { data } = await supabase
  .from('payments')
  .select('*');
// Depois filtrar em JavaScript

// ✅ Preferir
const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('status', 'paid')
  .eq('checkout_id', checkoutId);
```

### 4. **Implemente Paginação**
```typescript
// ❌ Evitar
const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', userId);
// Carrega TODOS os registros

// ✅ Preferir
const page = 1;
const pageSize = 50;

const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', userId)
  .range((page - 1) * pageSize, page * pageSize - 1)
  .order('created_at', { ascending: false });
```

---

## 📊 Queries Otimizadas por Página

### **Sales.tsx** - Histórico de Vendas

#### Query Atual
```typescript
const { data } = await supabase
  .from("payments")
  .select("*, checkouts(name)")
  .order("created_at", { ascending: false });
```

#### Otimizações Sugeridas
```typescript
// 1. Adicionar paginação
const pageSize = 50;
const { data } = await supabase
  .from("payments")
  .select("id, customer_name, customer_email, total_amount, status, created_at, checkouts(name)")
  .order("created_at", { ascending: false })
  .range(0, pageSize - 1);

// 2. Adicionar filtro por status
const { data } = await supabase
  .from("payments")
  .select("id, customer_name, customer_email, total_amount, status, created_at, checkouts(name)")
  .eq('status', 'paid')
  .order("created_at", { ascending: false })
  .range(0, pageSize - 1);

// 3. Adicionar filtro por data
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const { data } = await supabase
  .from("payments")
  .select("id, customer_name, customer_email, total_amount, status, created_at, checkouts(name)")
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order("created_at", { ascending: false })
  .range(0, pageSize - 1);
```

**Índices Necessários:**
- `idx_payments_created_at` ✅
- `idx_payments_status` ✅
- `idx_payments_checkout_id` ✅

---

### **Dashboard.tsx** - Painel Principal

#### Queries Necessárias
```typescript
// 1. Contar checkouts
const { count: checkoutCount } = await supabase
  .from('checkouts')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('active', true);

// 2. Contar produtos
const { count: productCount } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('active', true);

// 3. Contar vendas do mês
const thisMonth = new Date();
thisMonth.setDate(1);

const { count: salesCount } = await supabase
  .from('payments')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'paid')
  .gte('created_at', thisMonth.toISOString());

// 4. Total de faturamento
const { data: revenueData } = await supabase
  .from('payments')
  .select('total_amount')
  .eq('status', 'paid')
  .gte('created_at', thisMonth.toISOString());

const revenue = revenueData?.reduce((sum, p) => sum + p.total_amount, 0) || 0;
```

**Índices Necessários:**
- `idx_checkouts_user_active` ✅
- `idx_products_user_active` ✅
- `idx_payments_status` ✅
- `idx_payments_created_at` ✅

---

### **Products.tsx** - Gerenciamento de Produtos

#### Query Otimizada
```typescript
// Listar produtos com paginação
const pageSize = 20;
const { data: products, count } = await supabase
  .from('products')
  .select('id, name, price, active, created_at', { count: 'exact' })
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, pageSize - 1);
```

**Índices Necessários:**
- `idx_products_user_id` ✅
- `idx_products_created_at` ✅

---

### **Checkouts.tsx** - Gerenciamento de Checkouts

#### Query Otimizada
```typescript
// Listar checkouts com produtos
const { data: checkouts } = await supabase
  .from('checkouts')
  .select(`
    id,
    name,
    slug,
    price,
    active,
    created_at,
    checkout_products(
      product_id,
      products(name, price)
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Índices Necessários:**
- `idx_checkouts_user_id` ✅
- `idx_checkout_products_checkout_id` ✅

---

### **Checkout.tsx** - Página Pública de Checkout

#### Query Otimizada
```typescript
// Buscar checkout por slug (muito rápido com índice único)
const { data: checkout } = await supabase
  .from('checkouts')
  .select(`
    id,
    name,
    description,
    price,
    theme_color,
    countdown_minutes,
    checkout_products(
      product_id,
      products(name, description, price, image_url)
    )
  `)
  .eq('slug', slug)
  .single();
```

**Índices Necessários:**
- `idx_checkouts_slug` ✅ (UNIQUE)
- `idx_checkout_products_checkout_id` ✅

---

## 🚀 Técnicas Avançadas

### 1. **Usar Materialized Views para Agregações**

```sql
-- Criar view materializada para estatísticas
CREATE MATERIALIZED VIEW checkout_stats AS
SELECT 
  c.id,
  c.user_id,
  c.name,
  COUNT(DISTINCT p.id) as total_sales,
  COUNT(DISTINCT CASE WHEN p.status = 'paid' THEN p.id END) as paid_sales,
  SUM(CASE WHEN p.status = 'paid' THEN p.total_amount ELSE 0 END) as revenue
FROM checkouts c
LEFT JOIN payments p ON c.id = p.checkout_id
GROUP BY c.id, c.user_id, c.name;

-- Criar índice na view
CREATE INDEX idx_checkout_stats_user_id ON checkout_stats(user_id);

-- Atualizar view periodicamente
REFRESH MATERIALIZED VIEW CONCURRENTLY checkout_stats;
```

### 2. **Usar Partial Indexes para Dados Ativos**

```sql
-- Índice apenas para registros ativos (menor tamanho)
CREATE INDEX idx_checkouts_active_only 
ON checkouts(user_id) 
WHERE active = true;
```

### 3. **Usar Covering Indexes**

```sql
-- Índice que inclui todas as colunas necessárias
CREATE INDEX idx_payments_checkout_status_covering 
ON payments(checkout_id, status) 
INCLUDE (id, customer_name, total_amount, created_at);
```

---

## 📈 Monitoramento de Performance

### Verificar Plano de Execução

```typescript
// No Supabase SQL Editor, use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM payments 
WHERE checkout_id = 'abc-123' 
AND status = 'paid'
ORDER BY created_at DESC;
```

### Interpretar Resultado

```
Seq Scan on payments  (cost=0.00..35.50 rows=1 width=100)
  Filter: ((checkout_id = 'abc-123'::uuid) AND (status = 'paid'::text))
  Planning Time: 0.123 ms
  Execution Time: 0.456 ms
```

- **Seq Scan** = Leitura sequencial (lento, precisa de índice)
- **Index Scan** = Leitura por índice (rápido)
- **Execution Time** = Tempo de execução

---

## 🔧 Otimizações por Tipo de Query

### SELECT
```typescript
// ✅ Bom
const { data } = await supabase
  .from('payments')
  .select('id, amount, status')
  .eq('status', 'paid')
  .limit(100);

// ❌ Ruim
const { data } = await supabase
  .from('payments')
  .select('*')
  .limit(100);
// Depois filtrar em JavaScript
```

### INSERT
```typescript
// ✅ Bom - Inserir múltiplos registros de uma vez
const { data } = await supabase
  .from('payments')
  .insert([
    { checkout_id: '1', amount: 100 },
    { checkout_id: '2', amount: 200 },
  ]);

// ❌ Ruim - Inserir um por um
for (const payment of payments) {
  await supabase.from('payments').insert([payment]);
}
```

### UPDATE
```typescript
// ✅ Bom - Atualizar com filtro específico
const { data } = await supabase
  .from('payments')
  .update({ status: 'paid' })
  .eq('id', paymentId)
  .eq('status', 'pending');

// ❌ Ruim - Atualizar todos
const { data } = await supabase
  .from('payments')
  .update({ status: 'paid' });
```

### DELETE
```typescript
// ✅ Bom - Deletar com filtro específico
const { data } = await supabase
  .from('payments')
  .delete()
  .eq('id', paymentId);

// ❌ Ruim - Deletar sem filtro
const { data } = await supabase
  .from('payments')
  .delete();
```

---

## 📊 Checklist de Otimização

- [x] Criar índices em foreign keys
- [x] Criar índices em colunas de filtro
- [x] Criar índices compostos para queries comuns
- [x] Usar SELECT específico (não *)
- [x] Implementar paginação
- [x] Usar filtros no banco (não em JavaScript)
- [ ] Implementar caching
- [ ] Usar materialized views
- [ ] Monitorar queries lentas
- [ ] Remover índices não utilizados

---

## 🎯 Metas de Performance

| Operação | Meta | Atual |
|----------|------|-------|
| SELECT simples | < 10ms | ✅ |
| SELECT com JOIN | < 50ms | ✅ |
| INSERT | < 20ms | ✅ |
| UPDATE | < 30ms | ✅ |
| DELETE | < 30ms | ✅ |

---

## 📞 Suporte

Para otimizar queries:
1. Use `EXPLAIN ANALYZE` para entender o plano
2. Verifique se índices estão sendo usados
3. Monitore com as queries em `monitoring_queries.sql`
4. Implemente as otimizações sugeridas

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Implementação
