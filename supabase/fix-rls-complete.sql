-- Script COMPLETO para habilitar RLS e criar políticas

-- PASSO 1: Habilitar RLS em todas as tabelas
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Deletar todas as políticas antigas
DROP POLICY IF EXISTS "checkouts_select_public" ON checkouts;
DROP POLICY IF EXISTS "checkouts_insert_authenticated" ON checkouts;
DROP POLICY IF EXISTS "checkouts_update_authenticated" ON checkouts;
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_insert_authenticated" ON products;
DROP POLICY IF EXISTS "products_update_authenticated" ON products;
DROP POLICY IF EXISTS "order_bumps_select_public" ON order_bumps;
DROP POLICY IF EXISTS "order_bumps_insert_authenticated" ON order_bumps;
DROP POLICY IF EXISTS "order_bumps_update_authenticated" ON order_bumps;

-- PASSO 3: Criar políticas PERMISSIVAS para leitura (sem autenticação)
CREATE POLICY "checkouts_select_public" ON checkouts FOR SELECT USING (true);
CREATE POLICY "products_select_public" ON products FOR SELECT USING (true);
CREATE POLICY "order_bumps_select_public" ON order_bumps FOR SELECT USING (true);
CREATE POLICY "payments_select_public" ON payments FOR SELECT USING (true);
CREATE POLICY "webhooks_select_public" ON webhooks FOR SELECT USING (true);
CREATE POLICY "webhook_logs_select_public" ON webhook_logs FOR SELECT USING (true);
CREATE POLICY "email_logs_select_public" ON email_logs FOR SELECT USING (true);
CREATE POLICY "whatsapp_logs_select_public" ON whatsapp_logs FOR SELECT USING (true);
CREATE POLICY "deliverables_select_public" ON deliverables FOR SELECT USING (true);

-- PASSO 4: Criar políticas para INSERÇÃO (Edge Functions)
CREATE POLICY "checkouts_insert_service" ON checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "products_insert_service" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "order_bumps_insert_service" ON order_bumps FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_insert_service" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "webhooks_insert_service" ON webhooks FOR INSERT WITH CHECK (true);
CREATE POLICY "webhook_logs_insert_service" ON webhook_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "email_logs_insert_service" ON email_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "whatsapp_logs_insert_service" ON whatsapp_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "deliverables_insert_service" ON deliverables FOR INSERT WITH CHECK (true);

-- PASSO 5: Criar políticas para UPDATE (Edge Functions)
CREATE POLICY "checkouts_update_service" ON checkouts FOR UPDATE USING (true);
CREATE POLICY "products_update_service" ON products FOR UPDATE USING (true);
CREATE POLICY "order_bumps_update_service" ON order_bumps FOR UPDATE USING (true);
CREATE POLICY "payments_update_service" ON payments FOR UPDATE USING (true);
CREATE POLICY "webhooks_update_service" ON webhooks FOR UPDATE USING (true);
CREATE POLICY "webhook_logs_update_service" ON webhook_logs FOR UPDATE USING (true);
CREATE POLICY "email_logs_update_service" ON email_logs FOR UPDATE USING (true);
CREATE POLICY "whatsapp_logs_update_service" ON whatsapp_logs FOR UPDATE USING (true);
CREATE POLICY "deliverables_update_service" ON deliverables FOR UPDATE USING (true);

-- PASSO 6: Verificar políticas criadas
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename IN ('checkouts', 'products', 'order_bumps', 'payments')
ORDER BY tablename, policyname;
