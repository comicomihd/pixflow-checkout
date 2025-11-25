-- ============================================
-- QUERIES DE MONITORAMENTO - PIXFLOW CHECKOUT
-- ============================================
-- Use estas queries para monitorar performance
-- ============================================

-- ============================================
-- 1. LISTAR TODOS OS ÍNDICES
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 2. TAMANHO DOS ÍNDICES
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size,
  pg_relation_size(indexrelid) AS size_bytes
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- 3. ÍNDICES NÃO UTILIZADOS
-- ============================================
-- Índices que nunca foram usados (podem ser removidos)
SELECT 
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- 4. ÍNDICES MAIS UTILIZADOS
-- ============================================
-- Índices que mais ajudam na performance
SELECT 
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- ============================================
-- 5. TAMANHO DAS TABELAS
-- ============================================
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 6. CONTAGEM DE REGISTROS POR TABELA
-- ============================================
SELECT 
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================
-- 7. QUERIES LENTAS (Requer pg_stat_statements)
-- ============================================
-- Nota: Requer extensão pg_stat_statements habilitada
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- ============================================
-- 8. VERIFICAR FOREIGN KEYS SEM ÍNDICES
-- ============================================
-- Foreign keys devem ter índices para melhor performance
SELECT 
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 9. VERIFICAR DUPLICAÇÃO DE ÍNDICES
-- ============================================
-- Índices que cobrem as mesmas colunas
SELECT 
  pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS total_size,
  (array_agg(idx))[1] AS idx1,
  (array_agg(idx))[2] AS idx2,
  (array_agg(idx))[3] AS idx3,
  (array_agg(idx))[4] AS idx4
FROM (
  SELECT 
    pg_relation_name(idx) AS idx,
    (indrelid::text ||E'\n'|| indclass::text ||E'\n'|| indkey::text ||E'\n'|| coalesce(indexprs::text,'')||E'\n' || coalesce(indpred::text,'')) AS key
  FROM pg_index
) sub
GROUP BY key 
HAVING COUNT(*) > 1
ORDER BY total_size DESC;

-- ============================================
-- 10. ANALISAR TABELA ESPECÍFICA
-- ============================================
-- Substitua 'payments' pelo nome da tabela
ANALYZE payments;

-- ============================================
-- 11. EXPLICAR QUERY (EXPLAIN ANALYZE)
-- ============================================
-- Exemplo: Analisar performance de uma query
EXPLAIN ANALYZE
SELECT * FROM payments 
WHERE checkout_id = 'seu-id-aqui' 
AND status = 'paid'
ORDER BY created_at DESC;

-- ============================================
-- 12. VERIFICAR ÍNDICES FRAGMENTADOS
-- ============================================
-- Índices com alta fragmentação podem ser recriados
SELECT 
  schemaname,
  tablename,
  indexrelname,
  ROUND(100.0 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main')) / pg_relation_size(indexrelid), 2) AS fragmentation_percent
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND pg_relation_size(indexrelid) > 1000000
ORDER BY fragmentation_percent DESC;

-- ============================================
-- 13. VERIFICAR BLOAT EM ÍNDICES
-- ============================================
-- Índices com muito espaço não utilizado
SELECT 
  schemaname,
  tablename,
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  CASE 
    WHEN pg_relation_size(indexrelid) > 1000000 THEN 'Considere REINDEX'
    ELSE 'OK'
  END AS recommendation
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- 14. RECRIAR ÍNDICE FRAGMENTADO
-- ============================================
-- Exemplo: Recriar índice fragmentado
-- REINDEX INDEX CONCURRENTLY idx_payments_checkout_id;

-- ============================================
-- 15. REMOVER ÍNDICE NÃO UTILIZADO
-- ============================================
-- Exemplo: Remover índice que nunca foi usado
-- DROP INDEX IF EXISTS idx_nome_do_indice;
