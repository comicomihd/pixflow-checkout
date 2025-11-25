-- ============================================
-- VERIFICAÇÃO COMPLETA DO SETUP
-- ============================================

-- 1. Verificar se tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pix_payments') 
    THEN '✅ Tabela pix_payments EXISTE'
    ELSE '❌ Tabela pix_payments NÃO EXISTE'
  END as status_tabela;

-- 2. Listar todas as colunas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pix_payments'
ORDER BY ordinal_position;

-- 3. Verificar RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pix_payments';

-- 4. Listar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'pix_payments'
ORDER BY indexname;

-- 5. Listar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pix_payments';

-- 6. Contar registros
SELECT COUNT(*) as total_registros FROM public.pix_payments;

-- 7. Testar INSERT
INSERT INTO public.pix_payments (
  checkout_id,
  customer_name,
  customer_email,
  amount,
  total_amount,
  status
) VALUES (
  gen_random_uuid(),
  'Teste Verificação',
  'teste@verificacao.com',
  99.99,
  99.99,
  'pending'
) RETURNING id, customer_name, created_at;

-- 8. Verificar se o INSERT funcionou
SELECT 
  id,
  customer_name,
  customer_email,
  status,
  created_at,
  updated_at
FROM public.pix_payments
ORDER BY created_at DESC
LIMIT 1;
