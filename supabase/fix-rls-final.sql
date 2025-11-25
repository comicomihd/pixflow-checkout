-- Script FINAL para corrigir RLS - SOLUÇÃO DEFINITIVA

-- PASSO 1: Desabilitar RLS em todas as tabelas
ALTER TABLE checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Deletar todas as políticas antigas
DROP POLICY IF EXISTS "Users can manage own checkouts" ON checkouts;
DROP POLICY IF EXISTS "Anyone can view active checkouts" ON checkouts;
DROP POLICY IF EXISTS "Users can manage own products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Users can manage bumps through checkout" ON order_bumps;
DROP POLICY IF EXISTS "Anyone can view active bumps" ON order_bumps;

-- PASSO 3: Reabilitar RLS
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas PERMISSIVAS para leitura pública
CREATE POLICY "checkouts_select_public"
ON checkouts
FOR SELECT
USING (true);

CREATE POLICY "products_select_public"
ON products
FOR SELECT
USING (true);

CREATE POLICY "order_bumps_select_public"
ON order_bumps
FOR SELECT
USING (true);

-- PASSO 5: Criar políticas para usuários autenticados (escrita)
CREATE POLICY "checkouts_insert_authenticated"
ON checkouts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "checkouts_update_authenticated"
ON checkouts
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "products_insert_authenticated"
ON products
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_update_authenticated"
ON products
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "order_bumps_insert_authenticated"
ON order_bumps
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_bumps_update_authenticated"
ON order_bumps
FOR UPDATE
USING (auth.role() = 'authenticated');

-- PASSO 6: Verificar dados
SELECT 'Checkouts:' as tipo;
SELECT id, slug, active FROM checkouts WHERE slug = 'homologacao-pix';

SELECT 'Produtos:' as tipo;
SELECT id, name, active FROM products WHERE name LIKE '%Homologação%';

SELECT 'Order Bumps:' as tipo;
SELECT id, name, active FROM order_bumps WHERE name LIKE '%Homologação%';

-- PASSO 7: Testar query completa
SELECT c.id, c.slug, c.active, c.product_id, p.id, p.name, p.active
FROM checkouts c
INNER JOIN products p ON c.product_id = p.id
WHERE c.slug = 'homologacao-pix' AND c.active = true;
