-- Script para corrigir RLS e permitir leitura de checkouts ativos

-- PASSO 1: Verificar políticas de RLS atuais
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('checkouts', 'products', 'order_bumps')
ORDER BY tablename;

-- PASSO 2: Desabilitar RLS temporariamente para debug
ALTER TABLE checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Testar query sem RLS
SELECT c.id, c.slug, c.active, c.product_id, p.id as product_id, p.name
FROM checkouts c
LEFT JOIN products p ON c.product_id = p.id
WHERE c.slug = 'homologacao-pix' AND c.active = true;

-- PASSO 4: Reabilitar RLS
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar política permissiva para checkouts ativos (sem autenticação)
DROP POLICY IF EXISTS "Anyone can view active checkouts" ON checkouts;

CREATE POLICY "Anyone can view active checkouts"
ON checkouts
FOR SELECT
USING (active = true);

-- PASSO 6: Criar política permissiva para produtos ativos
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (active = true);

-- PASSO 7: Criar política permissiva para order_bumps ativos
DROP POLICY IF EXISTS "Anyone can view active bumps" ON order_bumps;

CREATE POLICY "Anyone can view active bumps"
ON order_bumps
FOR SELECT
USING (active = true);

-- PASSO 8: Verificar se as políticas foram criadas
SELECT tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename IN ('checkouts', 'products', 'order_bumps')
ORDER BY tablename;
