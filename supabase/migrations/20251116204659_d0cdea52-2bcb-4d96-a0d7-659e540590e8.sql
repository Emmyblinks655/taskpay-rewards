-- Create enum for task types
CREATE TYPE task_type AS ENUM ('twitter_follow', 'instagram_follow', 'youtube_subscribe', 'telegram_join', 'platform_signup', 'visit_url');

-- Create enum for submission status
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for payout status
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'rejected');

-- Create enum for payout methods
CREATE TYPE payout_method AS ENUM ('bank', 'crypto', 'mobile_money');

-- Create enum for ad types
CREATE TYPE ad_type AS ENUM ('code', 'image');

-- Create enum for ad placements
CREATE TYPE ad_placement AS ENUM ('homepage', 'dashboard', 'tasks', 'free_accounts');

-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  type task_type NOT NULL,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_submissions table
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  proof_image TEXT,
  username_proof TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Create payout_requests table
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payout_method NOT NULL,
  details JSONB NOT NULL,
  status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create free_accounts table
CREATE TABLE free_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status BOOLEAN NOT NULL DEFAULT true,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_name TEXT NOT NULL,
  ad_type ad_type NOT NULL,
  ad_content TEXT NOT NULL,
  placement ad_placement[] NOT NULL DEFAULT '{}',
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for tasks
CREATE POLICY "Anyone can view active tasks"
  ON tasks FOR SELECT
  USING (status = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for task_submissions
CREATE POLICY "Users can view own submissions"
  ON task_submissions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own submissions"
  ON task_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions"
  ON task_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payout_requests
CREATE POLICY "Users can view own payout requests"
  ON payout_requests FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own payout requests"
  ON payout_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payout requests"
  ON payout_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for free_accounts
CREATE POLICY "Users can view available accounts"
  ON free_accounts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can claim accounts"
  ON free_accounts FOR UPDATE
  USING (auth.uid() IS NOT NULL AND claimed_by IS NULL)
  WITH CHECK (auth.uid() = claimed_by);

CREATE POLICY "Admins can manage all accounts"
  ON free_accounts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ads
CREATE POLICY "Anyone can view active ads"
  ON ads FOR SELECT
  USING (status = true);

CREATE POLICY "Admins can manage ads"
  ON ads FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Insert default user role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_task_submissions_updated_at
  BEFORE UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_free_accounts_updated_at
  BEFORE UPDATE ON free_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for task proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-proofs', 'task-proofs', false);

-- Storage policies for task proofs
CREATE POLICY "Users can upload own proof"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'task-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own proof"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'task-proofs' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can manage all proofs"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'task-proofs' AND
    has_role(auth.uid(), 'admin')
  );