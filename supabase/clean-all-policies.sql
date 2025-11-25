-- Script para LIMPAR TODAS as políticas de RLS

-- Deletar TODAS as políticas da tabela payments
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'payments'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON payments';
    END LOOP;
END $$;

-- Desabilitar RLS na tabela payments
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'payments';
