-- Script para inserir dados de HOMOLOGAÇÃO

-- 1. Obter o user_id do usuário autenticado
-- Você precisa estar logado no Supabase para isso funcionar

-- 2. Inserir Produto de Homologação
-- Substitua 'SEU_USER_ID_AQUI' pelo seu user_id do Supabase
INSERT INTO products (user_id, name, description, price, active)
VALUES (
  (SELECT auth.uid()),
  'Produto Homologação PIX',
  'Produto para teste de homologação com Efí',
  '10.00',
  true
) ON CONFLICT DO NOTHING;

-- 2. Inserir Order Bump de Homologação
INSERT INTO order_bumps (product_id, name, description, price, active)
SELECT id, 'Bônus Homologação', 'Bônus para teste', '5.00', true
FROM products
WHERE name = 'Produto Homologação PIX'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Inserir Checkout de Homologação
INSERT INTO checkouts (slug, product_id, active, custom_fields)
SELECT 'homologacao-pix', id, true, '{}'::jsonb
FROM products
WHERE name = 'Produto Homologação PIX'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Verificar dados inseridos
SELECT 'Produtos de Homologação:' as tipo;
SELECT id, name, price FROM products WHERE name LIKE '%Homologação%';

SELECT 'Checkouts de Homologação:' as tipo;
SELECT id, slug, active FROM checkouts WHERE slug = 'homologacao-pix';
