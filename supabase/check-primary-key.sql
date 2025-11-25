-- ============================================
-- VERIFICAR PRIMARY KEY
-- ============================================

-- 1. Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pix_payments'
) as "Tabela Existe?";

-- 2. Listar PRIMARY KEY
SELECT 
  constraint_name,
  constraint_type,
  table_name,
  table_schema
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
AND table_name = 'pix_payments'
AND constraint_type = 'PRIMARY KEY';

-- 3. Listar coluna da PRIMARY KEY
SELECT 
  kcu.column_name,
  kcu.constraint_name,
  tc.constraint_type
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
  ON kcu.constraint_name = tc.constraint_name
  AND kcu.table_schema = tc.table_schema
WHERE kcu.table_schema = 'public' 
AND kcu.table_name = 'pix_payments'
AND tc.constraint_type = 'PRIMARY KEY';

-- 4. Verificar coluna ID
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pix_payments'
AND column_name = 'id';

-- 5. Listar TODAS as colunas
SELECT 
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pix_payments'
ORDER BY ordinal_position;

-- 6. Verificar RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'pix_payments';

-- 7. Verificar se tabela é visível para REST API
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'pix_payments';

-- 8. Contar registros
SELECT COUNT(*) as "Total de Registros" FROM public.pix_payments;
