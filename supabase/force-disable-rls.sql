-- FORÇA desabilitar RLS na tabela payments

-- Desabilitar RLS
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Confirmar
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'payments';
