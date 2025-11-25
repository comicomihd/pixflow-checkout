-- Script para habilitar RLS nas tabelas faltantes

-- PASSO 1: Habilitar RLS nas tabelas que faltam
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Criar políticas PERMISSIVAS para leitura
CREATE POLICY "customers_select_public" ON customers FOR SELECT USING (true);
CREATE POLICY "campaigns_select_public" ON campaigns FOR SELECT USING (true);
CREATE POLICY "automations_select_public" ON automations FOR SELECT USING (true);

-- PASSO 3: Criar políticas para INSERÇÃO
CREATE POLICY "customers_insert_service" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "campaigns_insert_service" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "automations_insert_service" ON automations FOR INSERT WITH CHECK (true);

-- PASSO 4: Criar políticas para UPDATE
CREATE POLICY "customers_update_service" ON customers FOR UPDATE USING (true);
CREATE POLICY "campaigns_update_service" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "automations_update_service" ON automations FOR UPDATE USING (true);

-- PASSO 5: Verificar se funcionou
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('customers', 'campaigns', 'automations')
ORDER BY tablename;
