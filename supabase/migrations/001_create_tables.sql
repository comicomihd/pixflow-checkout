-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_cpf TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  checkout_id TEXT,
  product_id TEXT,
  product_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT payments_email_check CHECK (customer_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

CREATE INDEX idx_payments_email ON payments(customer_email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  purchase_count INT DEFAULT 0,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'ativo', 'inativo', 'vip')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT customers_email_check CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  target_segment TEXT DEFAULT 'todos' CHECK (target_segment IN ('todos', 'vip', 'ativo', 'novo')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'sending')),
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-- Tabela de Automações
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('purchase', 'abandoned_cart', 'no_purchase_30days', 'vip_milestone')),
  action TEXT NOT NULL CHECK (action IN ('email', 'whatsapp', 'both')),
  message TEXT NOT NULL,
  delay_hours INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automations_active ON automations(active);
CREATE INDEX idx_automations_trigger ON automations(trigger);

-- Tabela de Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  event TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT webhooks_url_check CHECK (url ~ '^https?://')
);

CREATE INDEX idx_webhooks_event ON webhooks(event);
CREATE INDEX idx_webhooks_active ON webhooks(active);

-- Tabela de Logs de Webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  http_code INT,
  attempts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Tabela de Logs de Email
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT,
  type TEXT DEFAULT 'transactional' CHECK (type IN ('transactional', 'campaign', 'automation')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Tabela de Logs de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
  whatsapp_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_logs_to_phone ON whatsapp_logs(to_phone);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX idx_whatsapp_logs_created_at ON whatsapp_logs(created_at);

-- Tabela de Entregáveis
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('product', 'order_bump', 'upsell', 'downsell')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  links TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_item_id ON deliverables(item_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar total_spent e purchase_count do cliente
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE customers
    SET total_spent = total_spent + NEW.amount,
        purchase_count = purchase_count + 1,
        status = CASE 
          WHEN total_spent + NEW.amount > 500 THEN 'vip'
          WHEN purchase_count + 1 > 1 THEN 'ativo'
          ELSE 'novo'
        END
    WHERE email = NEW.customer_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats do cliente
CREATE TRIGGER update_customer_stats_trigger AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Função para criar cliente automaticamente
CREATE OR REPLACE FUNCTION create_customer_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customers (email, name, phone, cpf, status)
  VALUES (NEW.customer_email, NEW.customer_name, NEW.customer_phone, NEW.customer_cpf, 'novo')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar cliente
CREATE TRIGGER create_customer_trigger AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION create_customer_on_payment();
