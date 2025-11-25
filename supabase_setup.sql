CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'text',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#3b82f6',
  has_countdown BOOLEAN DEFAULT false,
  countdown_minutes INTEGER,
  custom_fields JSONB,
  testimonials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bump_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  txid TEXT,
  customer_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS presells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  price DECIMAL(10,2),
  bullet_points JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_bumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'text',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upsells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'text',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS downsells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'text',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upsell_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  upsell_id UUID NOT NULL REFERENCES upsells(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  txid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  upsell_payment_id UUID REFERENCES upsell_payments(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  product_name TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  delivery_content TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status_code INTEGER,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_slug ON checkouts(slug);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE presells ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE downsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checkouts" ON checkouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkouts" ON checkouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkouts" ON checkouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkouts" ON checkouts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view payments of their checkouts" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = payments.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their checkouts" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = payments.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments of their checkouts" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = payments.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own presells" ON presells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = presells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert presells" ON presells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = presells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own presells" ON presells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = presells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own upsells" ON upsells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = upsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert upsells" ON upsells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = upsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own upsells" ON upsells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = upsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own downsells" ON downsells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = downsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert downsells" ON downsells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = downsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own downsells" ON downsells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = downsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own order bumps" ON order_bumps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = order_bumps.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order bumps" ON order_bumps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = order_bumps.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own order bumps" ON order_bumps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM checkouts 
      WHERE checkouts.id = order_bumps.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own delivery logs" ON delivery_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = delivery_logs.payment_id 
      AND EXISTS (
        SELECT 1 FROM checkouts 
        WHERE checkouts.id = payments.checkout_id 
        AND checkouts.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own upsell payments" ON upsell_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = upsell_payments.payment_id 
      AND EXISTS (
        SELECT 1 FROM checkouts 
        WHERE checkouts.id = payments.checkout_id 
        AND checkouts.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own webhooks" ON webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks" ON webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks" ON webhooks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own webhook logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_logs.webhook_id 
      AND webhooks.user_id = auth.uid()
    )
  );
