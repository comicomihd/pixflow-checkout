-- ============================================
-- CRIAÇÃO DE ÍNDICES - PIXFLOW CHECKOUT
-- ============================================
-- Execute este script no Supabase SQL Editor
-- Caminho: Supabase Dashboard > SQL Editor > Paste & Run
-- ============================================

-- ============================================
-- ÍNDICES PARA TABELA: checkouts
-- ============================================

-- Índice para buscar checkouts por usuário
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id 
ON checkouts(user_id);

-- Índice único para slug (usado em rotas públicas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkouts_slug 
ON checkouts(slug);

-- Índice para filtrar checkouts ativos
CREATE INDEX IF NOT EXISTS idx_checkouts_active 
ON checkouts(active);

-- Índice composto para queries que filtram por usuário E status
CREATE INDEX IF NOT EXISTS idx_checkouts_user_active 
ON checkouts(user_id, active);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_checkouts_created_at 
ON checkouts(created_at DESC);

-- ============================================
-- ÍNDICES PARA TABELA: products
-- ============================================

-- Índice para buscar produtos por usuário
CREATE INDEX IF NOT EXISTS idx_products_user_id 
ON products(user_id);

-- Índice para filtrar produtos ativos
CREATE INDEX IF NOT EXISTS idx_products_active 
ON products(active);

-- Índice composto para queries que filtram por usuário E status
CREATE INDEX IF NOT EXISTS idx_products_user_active 
ON products(user_id, active);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- ============================================
-- ÍNDICES PARA TABELA: checkout_products
-- ============================================

-- Índice para buscar produtos de um checkout
CREATE INDEX IF NOT EXISTS idx_checkout_products_checkout_id 
ON checkout_products(checkout_id);

-- Índice para buscar checkouts de um produto
CREATE INDEX IF NOT EXISTS idx_checkout_products_product_id 
ON checkout_products(product_id);

-- Índice composto para queries que filtram por ambos
CREATE INDEX IF NOT EXISTS idx_checkout_products_checkout_product 
ON checkout_products(checkout_id, product_id);

-- ============================================
-- ÍNDICES PARA TABELA: payments
-- ============================================

-- Índice para buscar pagamentos de um checkout
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id 
ON payments(checkout_id);

-- Índice para filtrar pagamentos por status
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Índice para ordenação por data (descendente para mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_payments_created_at 
ON payments(created_at DESC);

-- Índice composto para queries que filtram por checkout E status
CREATE INDEX IF NOT EXISTS idx_payments_checkout_status 
ON payments(checkout_id, status);

-- Índice para buscar pagamentos por email do cliente
CREATE INDEX IF NOT EXISTS idx_payments_customer_email 
ON payments(customer_email);

-- Índice para buscar pagamentos pagos em um período
CREATE INDEX IF NOT EXISTS idx_payments_paid_at 
ON payments(paid_at DESC) WHERE paid_at IS NOT NULL;

-- ============================================
-- ÍNDICES PARA TABELA: upsells
-- ============================================

-- Índice para buscar upsells de um checkout
CREATE INDEX IF NOT EXISTS idx_upsells_checkout_id 
ON upsells(checkout_id);

-- Índice para filtrar upsells ativos
CREATE INDEX IF NOT EXISTS idx_upsells_active 
ON upsells(active);

-- Índice composto para queries que filtram por checkout E status
CREATE INDEX IF NOT EXISTS idx_upsells_checkout_active 
ON upsells(checkout_id, active);

-- ============================================
-- ÍNDICES PARA TABELA: downsells
-- ============================================

-- Índice para buscar downsells de um checkout
CREATE INDEX IF NOT EXISTS idx_downsells_checkout_id 
ON downsells(checkout_id);

-- Índice para filtrar downsells ativos
CREATE INDEX IF NOT EXISTS idx_downsells_active 
ON downsells(active);

-- Índice composto para queries que filtram por checkout E status
CREATE INDEX IF NOT EXISTS idx_downsells_checkout_active 
ON downsells(checkout_id, active);

-- ============================================
-- ÍNDICES PARA TABELA: presells
-- ============================================

-- Índice para buscar presells de um checkout
CREATE INDEX IF NOT EXISTS idx_presells_checkout_id 
ON presells(checkout_id);

-- Índice para filtrar presells ativos
CREATE INDEX IF NOT EXISTS idx_presells_active 
ON presells(active);

-- Índice composto para queries que filtram por checkout E status
CREATE INDEX IF NOT EXISTS idx_presells_checkout_active 
ON presells(checkout_id, active);

-- ============================================
-- ÍNDICES PARA TABELA: delivery_logs
-- ============================================

-- Índice para buscar entregas de um pagamento
CREATE INDEX IF NOT EXISTS idx_delivery_logs_payment_id 
ON delivery_logs(payment_id);

-- Índice para buscar entregas de um produto
CREATE INDEX IF NOT EXISTS idx_delivery_logs_product_id 
ON delivery_logs(product_id);

-- Índice para filtrar entregas por status
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status 
ON delivery_logs(status);

-- Índice composto para queries que filtram por pagamento E status
CREATE INDEX IF NOT EXISTS idx_delivery_logs_payment_status 
ON delivery_logs(payment_id, status);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_delivery_logs_created_at 
ON delivery_logs(created_at DESC);

-- ============================================
-- VERIFICAR ÍNDICES CRIADOS
-- ============================================
-- Execute esta query para verificar todos os índices:
-- SELECT schemaname, tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;
