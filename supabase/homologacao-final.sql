-- Script FINAL para inserir dados de HOMOLOGAÇÃO
-- Este script cria o perfil e depois os produtos

-- PASSO 1: Criar perfil do usuário (se não existir)
INSERT INTO profiles (id, email, full_name)
VALUES (
  '3daba7ea-262d-4544-87cc-60ad6158f250',
  'teste@homologacao.com',
  'Usuário Homologação'
) ON CONFLICT (id) DO NOTHING;

-- PASSO 2: Inserir Produto de Homologação
INSERT INTO products (user_id, name, description, price, active)
VALUES (
  '3daba7ea-262d-4544-87cc-60ad6158f250',
  'Produto Homologação PIX',
  'Produto para teste de homologação com Efí',
  '10.00',
  true
) ON CONFLICT DO NOTHING
RETURNING id as product_id;

-- PASSO 3: Inserir Order Bump de Homologação
INSERT INTO order_bumps (product_id, name, description, price, active)
SELECT id, 'Bônus Homologação', 'Bônus para teste', '5.00', true
FROM products
WHERE name = 'Produto Homologação PIX' AND user_id = '3daba7ea-262d-4544-87cc-60ad6158f250'
LIMIT 1
ON CONFLICT DO NOTHING;

-- PASSO 4: Inserir Checkout de Homologação
INSERT INTO checkouts (user_id, slug, product_id, active, custom_fields)
SELECT '3daba7ea-262d-4544-87cc-60ad6158f250', 'homologacao-pix', id, true, '{}'::jsonb
FROM products
WHERE name = 'Produto Homologação PIX' AND user_id = '3daba7ea-262d-4544-87cc-60ad6158f250'
LIMIT 1
ON CONFLICT DO NOTHING;

-- PASSO 5: Verificar dados inseridos
SELECT 'Perfil criado:' as tipo;
SELECT id, email, full_name FROM profiles WHERE id = '3daba7ea-262d-4544-87cc-60ad6158f250';

SELECT 'Produtos de Homologação:' as tipo;
SELECT id, user_id, name, price FROM products WHERE name LIKE '%Homologação%';

SELECT 'Checkouts de Homologação:' as tipo;
SELECT id, slug, active FROM checkouts WHERE slug = 'homologacao-pix';
