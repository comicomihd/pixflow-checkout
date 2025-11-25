-- ============================================
-- CRIAR TABELA PIX_PAYMENTS (FINAL)
-- ============================================

-- 1. Deletar tabela antiga se existir
DROP TABLE IF EXISTS public.pix_payments CASCADE;

-- 2. Criar tabela nova com schema completo
CREATE TABLE public.pix_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Referências
  checkout_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do cliente
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text,
  customer_whatsapp text,
  customer_data jsonb,
  
  -- Valores
  amount numeric(10, 2) NOT NULL,
  bump_amount numeric(10, 2) DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  
  -- Status PIX
  status text DEFAULT 'pending', -- pending, paid, expired, failed
  txid text UNIQUE,
  loc_id integer,
  pix_copy_paste text,
  pix_qr_code text,
  
  -- Timestamps
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Desabilitar RLS (acesso público)
ALTER TABLE public.pix_payments DISABLE ROW LEVEL SECURITY;

-- 4. Criar índices para performance
CREATE INDEX idx_pix_payments_checkout_id ON public.pix_payments(checkout_id);
CREATE INDEX idx_pix_payments_customer_email ON public.pix_payments(customer_email);
CREATE INDEX idx_pix_payments_status ON public.pix_payments(status);
CREATE INDEX idx_pix_payments_txid ON public.pix_payments(txid);
CREATE INDEX idx_pix_payments_user_id ON public.pix_payments(user_id);
CREATE INDEX idx_pix_payments_created_at ON public.pix_payments(created_at DESC);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS handle_pix_payments_updated_at ON public.pix_payments;
CREATE TRIGGER handle_pix_payments_updated_at
BEFORE UPDATE ON public.pix_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. Verificação final
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'pix_payments';

-- 8. Listar colunas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pix_payments'
ORDER BY ordinal_position;
