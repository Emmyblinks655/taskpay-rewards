-- Create ENUM types
CREATE TYPE service_category AS ENUM ('airtime', 'data', 'cable_tv', 'electricity', 'internet');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'commission', 'withdrawal', 'topup');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_service_id TEXT NOT NULL,
  category service_category NOT NULL,
  country_code TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_key_encrypted TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  config_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provider logs table
CREATE TABLE provider_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  order_id UUID,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  reference TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  provider_id UUID REFERENCES providers(id),
  amount NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  commission NUMERIC NOT NULL DEFAULT 0,
  target TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  provider_ref TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  commission_amount NUMERIC NOT NULL,
  commission_percent NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP codes table
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update profiles table with new fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_agent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_rate_multiplier NUMERIC DEFAULT 1.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status NOT NULL DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_reviewed_by UUID REFERENCES profiles(id);

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (status = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for providers
CREATE POLICY "Only admins can view providers" ON providers
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage providers" ON providers
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for provider_logs
CREATE POLICY "Only admins can view provider logs" ON provider_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert provider logs" ON provider_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only system can create transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create referrals" ON referrals
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for otp_codes
CREATE POLICY "Users can view own OTP" ON otp_codes
  FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can create OTP" ON otp_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own OTP" ON otp_codes
  FOR UPDATE USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- RLS Policies for settings
CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage settings" ON settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists_code;
    
    EXIT WHEN NOT exists_code;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Trigger function to set referral code on profile creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profile_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Function to process order and handle commissions
CREATE OR REPLACE FUNCTION process_order(
  p_order_id UUID,
  p_new_status order_status,
  p_provider_ref TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_user profiles%ROWTYPE;
  v_referrer_id UUID;
  v_commission_percent NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Update order status
  UPDATE orders 
  SET status = p_new_status,
      provider_ref = COALESCE(p_provider_ref, provider_ref),
      error_message = p_error_message,
      updated_at = now()
  WHERE id = p_order_id;
  
  -- If order failed, refund the user
  IF p_new_status = 'failed' OR p_new_status = 'refunded' THEN
    -- Get user details
    SELECT * INTO v_user FROM profiles WHERE id = v_order.user_id;
    
    -- Refund wallet
    UPDATE profiles 
    SET balance = balance + v_order.cost,
        updated_at = now()
    WHERE id = v_order.user_id;
    
    -- Log wallet transaction
    INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, reference, description)
    VALUES (
      v_order.user_id,
      'credit',
      v_order.cost,
      v_user.balance,
      v_user.balance + v_order.cost,
      'ORDER_REFUND_' || p_order_id::text,
      'Refund for failed order'
    );
  END IF;
  
  -- If order completed, process referral commission
  IF p_new_status = 'completed' THEN
    SELECT * INTO v_user FROM profiles WHERE id = v_order.user_id;
    
    IF v_user.referred_by IS NOT NULL THEN
      -- Get commission percentage from settings
      SELECT (value->>'referral_commission_percent')::NUMERIC 
      INTO v_commission_percent
      FROM settings 
      WHERE key = 'referral_commission';
      
      -- Default to 1% if not set
      v_commission_percent := COALESCE(v_commission_percent, 1.0);
      
      -- Calculate commission (max 5%)
      v_commission_percent := LEAST(v_commission_percent, 5.0);
      v_commission_amount := v_order.cost * (v_commission_percent / 100);
      
      -- Credit referrer
      UPDATE profiles 
      SET balance = balance + v_commission_amount,
          updated_at = now()
      WHERE id = v_user.referred_by;
      
      -- Log referral commission
      INSERT INTO referrals (referrer_id, referred_id, order_id, commission_amount, commission_percent)
      VALUES (v_user.referred_by, v_order.user_id, p_order_id, v_commission_amount, v_commission_percent);
      
      -- Log wallet transaction for referrer
      SELECT balance - v_commission_amount INTO v_user.balance FROM profiles WHERE id = v_user.referred_by;
      
      INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, reference, description)
      VALUES (
        v_user.referred_by,
        'commission',
        v_commission_amount,
        v_user.balance,
        v_user.balance + v_commission_amount,
        'REFERRAL_' || p_order_id::text,
        'Referral commission from order'
      );
    END IF;
  END IF;
END;
$$;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('global_markup_percent', '{"value": 0}'::jsonb),
  ('referral_commission', '{"referral_commission_percent": 1.0, "max_commission_percent": 5.0}'::jsonb),
  ('kyc_required', '{"value": false}'::jsonb),
  ('min_withdrawal', '{"value": 10}'::jsonb);

-- Insert mock provider
INSERT INTO providers (name, api_key_encrypted, enabled, priority, config_json) VALUES
  ('Mock Provider', 'encrypted_mock_key_12345', true, 1, '{"base_url": "https://mock-api.example.com", "timeout": 30}'::jsonb);

-- Insert mock services for 3 countries
INSERT INTO services (provider_service_id, category, country_code, operator_name, name, price, sale_price, currency, status)
VALUES
  -- Nigeria Services
  ('NG_MTN_AIRTIME_100', 'airtime', 'NG', 'MTN', 'MTN Airtime ₦100', 100, 98, 'NGN', true),
  ('NG_MTN_DATA_1GB', 'data', 'NG', 'MTN', 'MTN 1GB Data', 300, 295, 'NGN', true),
  ('NG_GLO_AIRTIME_100', 'airtime', 'NG', 'Glo', 'Glo Airtime ₦100', 100, 98, 'NGN', true),
  ('NG_AIRTEL_DATA_2GB', 'data', 'NG', 'Airtel', 'Airtel 2GB Data', 500, 490, 'NGN', true),
  ('NG_9MOBILE_AIRTIME_100', 'airtime', 'NG', '9mobile', '9mobile Airtime ₦100', 100, 98, 'NGN', true),
  
  -- Ghana Services
  ('GH_MTN_AIRTIME_5', 'airtime', 'GH', 'MTN', 'MTN Airtime GH₵5', 5, 4.90, 'GHS', true),
  ('GH_VODAFONE_DATA_1GB', 'data', 'GH', 'Vodafone', 'Vodafone 1GB Data', 15, 14.50, 'GHS', true),
  ('GH_AIRTELTIGO_AIRTIME_10', 'airtime', 'GH', 'AirtelTigo', 'AirtelTigo Airtime GH₵10', 10, 9.80, 'GHS', true),
  
  -- Kenya Services
  ('KE_SAFARICOM_AIRTIME_100', 'airtime', 'KE', 'Safaricom', 'Safaricom Airtime KSh100', 100, 98, 'KES', true),
  ('KE_SAFARICOM_DATA_1GB', 'data', 'KE', 'Safaricom', 'Safaricom 1GB Data', 300, 295, 'KES', true),
  ('KE_AIRTEL_AIRTIME_100', 'airtime', 'KE', 'Airtel', 'Airtel Airtime KSh100', 100, 98, 'KES', true),
  ('KE_TELKOM_DATA_2GB', 'data', 'KE', 'Telkom', 'Telkom 2GB Data', 500, 490, 'KES', true);

-- Create admin user role (if email exists in profiles)
DO $$
DECLARE
  v_admin_user_id UUID;
BEGIN
  -- Try to find user by email
  SELECT id INTO v_admin_user_id FROM profiles WHERE email = 'emmystech26@gmail.com';
  
  IF v_admin_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO user_roles (user_id, role)
    VALUES (v_admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;