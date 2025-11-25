-- Script para inserir dados de teste

-- 1. Inserir Produto de Teste
INSERT INTO products (name, description, price, active)
VALUES (
  'Curso Completo de Desenvolvimento',
  'Aprenda desenvolvimento web do zero ao avançado',
  '199.90',
  true
) ON CONFLICT DO NOTHING;

-- 2. Inserir Order Bump (Complemento)
INSERT INTO order_bumps (product_id, name, description, price, active)
SELECT id, 'Bônus: Templates Prontos', 'Receba 50 templates prontos para usar', '49.90', true
FROM products
WHERE name = 'Curso Completo de Desenvolvimento'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Inserir Checkout de Teste
INSERT INTO checkouts (slug, product_id, active, custom_fields)
SELECT 'teste-pix', id, true, '{}'::jsonb
FROM products
WHERE name = 'Curso Completo de Desenvolvimento'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Verificar dados inseridos
SELECT 'Produtos:' as tipo;
SELECT id, name, price FROM products LIMIT 5;

SELECT 'Order Bumps:' as tipo;
SELECT id, name, price FROM order_bumps LIMIT 5;

SELECT 'Checkouts:' as tipo;
SELECT id, slug, active FROM checkouts LIMIT 5;
