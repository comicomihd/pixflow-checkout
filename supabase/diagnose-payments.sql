-- Script de diagnóstico para tabela payments

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'payments';

-- 2. Listar TODAS as políticas da tabela payments
SELECT 
  policyname,
  permissive,
  roles,
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

-- 3. Verificar se há políticas que bloqueiam INSERT
SELECT 
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'payments' 
AND cmd = 'INSERT';

-- 4. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
