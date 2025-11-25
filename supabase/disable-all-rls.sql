-- Script para DESABILITAR RLS em TODAS as tabelas

ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity
FROM pg_class
JOIN pg_tables ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public'
ORDER BY tablename;
