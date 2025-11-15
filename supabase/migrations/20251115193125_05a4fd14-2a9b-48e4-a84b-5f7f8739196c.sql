-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'expired', 'cancelled');

-- Create enum for product delivery type
CREATE TYPE delivery_type AS ENUM ('file', 'link', 'text');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'link',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

-- Create checkouts table
CREATE TABLE public.checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  theme_color TEXT DEFAULT '#6366f1',
  logo_url TEXT,
  testimonials JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '[]',
  has_countdown BOOLEAN DEFAULT false,
  countdown_minutes INTEGER DEFAULT 15,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkouts" ON public.checkouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active checkouts" ON public.checkouts
  FOR SELECT USING (active = true);

-- Create order_bumps table
CREATE TABLE public.order_bumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'link',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bumps through checkout" ON public.order_bumps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checkouts 
      WHERE checkouts.id = order_bumps.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active bumps" ON public.order_bumps
  FOR SELECT USING (active = true);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_data JSONB DEFAULT '{}',
  amount DECIMAL(10,2) NOT NULL,
  bump_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  txid TEXT UNIQUE,
  pix_copy_paste TEXT,
  pix_qr_code TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkouts 
      WHERE checkouts.id = payments.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

-- Create upsells table
CREATE TABLE public.upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'link',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage upsells through checkout" ON public.upsells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checkouts 
      WHERE checkouts.id = upsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active upsells" ON public.upsells
  FOR SELECT USING (active = true);

-- Create downsells table
CREATE TABLE public.downsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'link',
  delivery_content TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.downsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage downsells through checkout" ON public.downsells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checkouts 
      WHERE checkouts.id = downsells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active downsells" ON public.downsells
  FOR SELECT USING (active = true);

-- Create presells table
CREATE TABLE public.presells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  bullet_points JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.presells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage presells through checkout" ON public.presells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checkouts 
      WHERE checkouts.id = presells.checkout_id 
      AND checkouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active presells" ON public.presells
  FOR SELECT USING (active = true);

-- Create upsell_payments table (for 1-click upsells)
CREATE TABLE public.upsell_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  upsell_id UUID REFERENCES public.upsells(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  txid TEXT UNIQUE,
  pix_copy_paste TEXT,
  pix_qr_code TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.upsell_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upsell payments" ON public.upsell_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.checkouts c ON c.id = p.checkout_id
      WHERE p.id = upsell_payments.payment_id 
      AND c.user_id = auth.uid()
    )
  );

-- Create delivery_logs table
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  upsell_payment_id UUID REFERENCES public.upsell_payments(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  product_name TEXT NOT NULL,
  delivery_type delivery_type NOT NULL,
  delivery_content TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own delivery logs" ON public.delivery_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.checkouts c ON c.id = p.checkout_id
      WHERE p.id = delivery_logs.payment_id 
      AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.upsell_payments up
      JOIN public.payments p ON p.id = up.payment_id
      JOIN public.checkouts c ON c.id = p.checkout_id
      WHERE up.id = delivery_logs.upsell_payment_id 
      AND c.user_id = auth.uid()
    )
  );