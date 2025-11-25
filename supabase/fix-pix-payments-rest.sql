-- ============================================
-- CORRIGIR TABELA PIX_PAYMENTS PARA REST API
-- ============================================

-- 1. Deletar tabela completamente
DROP TABLE IF EXISTS public.pix_payments CASCADE;

-- 2. Criar tabela com schema EXPLÍCITO no public schema
CREATE TABLE public.pix_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text,
  customer_whatsapp text,
  customer_data jsonb,
  amount numeric(10, 2) NOT NULL,
  bump_amount numeric(10, 2) DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  txid text UNIQUE,
  loc_id integer,
  pix_copy_paste text,
  pix_qr_code text,
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Garantir que está em public schema
ALTER TABLE public.pix_payments SET SCHEMA public;

-- 4. Desabilitar RLS explicitamente
ALTER TABLE public.pix_payments DISABLE ROW LEVEL SECURITY;

-- 5. Criar índices
CREATE INDEX idx_pix_payments_checkout_id ON public.pix_payments(checkout_id);
CREATE INDEX idx_pix_payments_customer_email ON public.pix_payments(customer_email);
CREATE INDEX idx_pix_payments_status ON public.pix_payments(status);
CREATE INDEX idx_pix_payments_txid ON public.pix_payments(txid);
CREATE INDEX idx_pix_payments_created_at ON public.pix_payments(created_at DESC);

-- 6. Criar função para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger
DROP TRIGGER IF EXISTS handle_pix_payments_updated_at ON public.pix_payments;
CREATE TRIGGER handle_pix_payments_updated_at
BEFORE UPDATE ON public.pix_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 8. IMPORTANTE: Notificar PostgREST para recarregar schema
NOTIFY pgrst, 'reload schema';

-- 9. Verificar se tabela existe e está acessível
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pix_payments';

-- 10. Listar colunas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pix_payments'
ORDER BY ordinal_position;

-- 11. Verificar PRIMARY KEY
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'pix_payments';

-- 12. Teste de INSERT
INSERT INTO public.pix_payments (
  checkout_id,
  customer_name,
  customer_email,
  amount,
  total_amount,
  status
) VALUES (
  gen_random_uuid(),
  'Teste',
  'teste@example.com',
  29.90,
  29.90,
  'pending'
) RETURNING id, customer_name, created_at;

-- 13. Teste de SELECT
SELECT * FROM public.pix_payments ORDER BY created_at DESC LIMIT 1;
