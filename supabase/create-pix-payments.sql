-- Criar tabela PIX_PAYMENTS do zero (sem RLS)

-- Deletar tabela antiga se existir
DROP TABLE IF EXISTS public.pix_payments CASCADE;

-- Criar tabela nova
CREATE TABLE public.pix_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text,
  customer_whatsapp text,
  amount numeric NOT NULL,
  bump_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  txid text,
  pix_copy_paste text,
  pix_qr_code text,
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- NÃO HABILITAR RLS
ALTER TABLE public.pix_payments DISABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX pix_payments_checkout_id ON pix_payments(checkout_id);
CREATE INDEX pix_payments_customer_email ON pix_payments(customer_email);
CREATE INDEX pix_payments_status ON pix_payments(status);
CREATE INDEX pix_payments_txid ON pix_payments(txid);

-- Verificar
SELECT * FROM public.pix_payments LIMIT 1;
