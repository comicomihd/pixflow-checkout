-- Script FINAL para corrigir tabela payments

-- PASSO 1: Desabilitar RLS
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Deletar TODAS as políticas
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "payments_select_public" ON payments;
DROP POLICY IF EXISTS "payments_insert_service" ON payments;
DROP POLICY IF EXISTS "payments_update_service" ON payments;
DROP POLICY IF EXISTS "payments_select_all" ON payments;
DROP POLICY IF EXISTS "payments_insert_all" ON payments;
DROP POLICY IF EXISTS "payments_update_all" ON payments;
DROP POLICY IF EXISTS "payments_delete_all" ON payments;
