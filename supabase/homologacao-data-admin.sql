-- Script ADMIN para inserir dados de HOMOLOGAÇÃO
-- Use este script se o anterior não funcionar

-- PASSO 1: Obter seu user_id
-- Execute esta query primeiro para descobrir seu user_id:
SELECT id, email FROM auth.users LIMIT 1;
-- Copie o ID retornado

-- PASSO 2: Substituir 'COLE_SEU_USER_ID_AQUI' pelo ID obtido acima

-- 1. Inserir Produto de Homologação
INSERT INTO products (user_id, name, description, price, active)
VALUES (
  '3daba7ea-262d-4544-87cc-60ad6158f250',
  'Produto Homologação PIX',
  'Produto para teste de homologação com Efí',
  '10.00',
  true
) ON CONFLICT DO NOTHING
RETURNING id as product_id;

-- 2. Inserir Order Bump de Homologação
INSERT INTO order_bumps (product_id, name, description, price, active)
SELECT id, 'Bônus Homologação', 'Bônus para teste', '5.00', true
FROM products
WHERE name = 'Produto Homologação PIX' AND user_id = '3daba7ea-262d-4544-87cc-60ad6158f250'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Inserir Checkout de Homologação
INSERT INTO checkouts (user_id, slug, product_id, active, custom_fields)
SELECT '3daba7ea-262d-4544-87cc-60ad6158f250', 'homologacao-pix', id, true, '{}'::jsonb
FROM products
WHERE name = 'Produto Homologação PIX' AND user_id = '3daba7ea-262d-4544-87cc-60ad6158f250'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Verificar dados inseridos
SELECT 'Produtos de Homologação:' as tipo;
SELECT id, user_id, name, price FROM products WHERE name LIKE '%Homologação%';

SELECT 'Checkouts de Homologação:' as tipo;
SELECT id, slug, active FROM checkouts WHERE slug = 'homologacao-pix';
