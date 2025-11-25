-- Criar tabela payments_temp SEM RLS

CREATE TABLE IF NOT EXISTS public.payments_temp (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_data jsonb,
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

-- Desabilitar RLS (importante!)
ALTER TABLE public.payments_temp DISABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX IF NOT EXISTS payments_temp_checkout_id ON payments_temp(checkout_id);
CREATE INDEX IF NOT EXISTS payments_temp_customer_email ON payments_temp(customer_email);
CREATE INDEX IF NOT EXISTS payments_temp_status ON payments_temp(status);

-- Verificar
SELECT * FROM public.payments_temp LIMIT 1;
