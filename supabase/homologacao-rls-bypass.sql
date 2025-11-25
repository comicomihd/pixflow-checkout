-- Script para BYPASS de RLS e inserir dados de HOMOLOGAÇÃO

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Criar perfil do usuário
INSERT INTO profiles (id, email, name)
VALUES (
  '3daba7ea-262d-4544-87cc-60ad6158f250',
  'teste@homologacao.com',
  'Usuário Homologação'
) ON CONFLICT (id) DO NOTHING;

-- PASSO 3: Inserir Produto de Homologação
INSERT INTO products (user_id, name, description, price, active)
VALUES (
  '3daba7ea-262d-4544-87cc-60ad6158f250',
  'Produto Homologação PIX',
  'Produto para teste de homologação com Efí',
  '10.00',
  true
) ON CONFLICT DO NOTHING;

-- PASSO 4: Inserir Order Bump de Homologação
INSERT INTO order_bumps (checkout_id, name, description, price, active)
SELECT c.id, 'Bônus Homologação', 'Bônus para teste', '5.00', true
FROM checkouts c
WHERE c.slug = 'homologacao-pix'
LIMIT 1
ON CONFLICT DO NOTHING;

-- PASSO 5: Inserir Checkout de Homologação
INSERT INTO checkouts (user_id, product_id, name, slug, active, custom_fields)
SELECT '3daba7ea-262d-4544-87cc-60ad6158f250', id, 'Checkout Homologação PIX', 'homologacao-pix', true, '{}'::jsonb
FROM products
WHERE name = 'Produto Homologação PIX' AND user_id = '3daba7ea-262d-4544-87cc-60ad6158f250'
LIMIT 1
ON CONFLICT DO NOTHING;

-- PASSO 6: Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Verificar dados inseridos
SELECT 'Perfil criado:' as tipo;
SELECT id, email, name FROM profiles WHERE id = '3daba7ea-262d-4544-87cc-60ad6158f250';

SELECT 'Produtos de Homologação:' as tipo;
SELECT id, user_id, name, price FROM products WHERE name LIKE '%Homologação%';

SELECT 'Checkouts de Homologação:' as tipo;
SELECT id, slug, active FROM checkouts WHERE slug = 'homologacao-pix';
