-- Atualizar schema da tabela payments

-- PASSO 1: Desabilitar RLS
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Adicionar colunas faltantes
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS customer_data jsonb,
ADD COLUMN IF NOT EXISTS bump_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS txid text,
ADD COLUMN IF NOT EXISTS pix_copy_paste text,
ADD COLUMN IF NOT EXISTS pix_qr_code text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- PASSO 3: Corrigir tipo de checkout_id (de text para uuid)
-- Primeiro, criar coluna temporária
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS checkout_id_uuid uuid;

-- Copiar dados (convertendo de text para uuid)
UPDATE public.payments 
SET checkout_id_uuid = checkout_id::uuid 
WHERE checkout_id IS NOT NULL;

-- Deletar coluna antiga
ALTER TABLE public.payments 
DROP COLUMN IF EXISTS checkout_id;

-- Renomear coluna nova
ALTER TABLE public.payments 
RENAME COLUMN checkout_id_uuid TO checkout_id;

-- PASSO 4: Verificar resultado
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
