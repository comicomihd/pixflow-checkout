-- Script para corrigir RLS na tabela payments

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Deletar todas as políticas antigas
DROP POLICY IF EXISTS "payments_select_public" ON payments;
DROP POLICY IF EXISTS "payments_insert_service" ON payments;
DROP POLICY IF EXISTS "payments_update_service" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

-- PASSO 3: Reabilitar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas PERMISSIVAS (sem restrições)
CREATE POLICY "payments_select_all" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert_all" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update_all" ON payments FOR UPDATE USING (true);
CREATE POLICY "payments_delete_all" ON payments FOR DELETE USING (true);

-- PASSO 5: Verificar políticas
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;
