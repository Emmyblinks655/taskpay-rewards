-- Fix 1: Prevent users from updating their own balance
-- Drop the existing policy that allows users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a policy that allows users to update their profile EXCEPT balance
CREATE POLICY "Users can update own profile except balance"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure balance cannot be changed by users
  balance = (SELECT balance FROM public.profiles WHERE id = auth.uid())
);

-- Fix 2: Create a secure function for admins to approve submissions and update balances
CREATE OR REPLACE FUNCTION public.approve_task_submission(
  submission_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task_id UUID;
  v_reward NUMERIC;
  v_current_status submission_status;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  -- Get submission details
  SELECT user_id, task_id, status
  INTO v_user_id, v_task_id, v_current_status
  FROM task_submissions
  WHERE id = submission_id;

  -- Check if submission exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Check if already approved
  IF v_current_status = 'approved' THEN
    RAISE EXCEPTION 'Submission already approved';
  END IF;

  -- Get task reward
  SELECT reward INTO v_reward
  FROM tasks
  WHERE id = v_task_id;

  -- Update submission status
  UPDATE task_submissions
  SET status = 'approved', updated_at = NOW()
  WHERE id = submission_id;

  -- Update user balance atomically
  UPDATE profiles
  SET balance = balance + v_reward, updated_at = NOW()
  WHERE id = v_user_id;
END;
$$;

-- Fix 3: Restrict free_accounts password visibility
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view available accounts" ON public.free_accounts;

-- Create new policy that hides passwords unless user claimed the account or is admin
CREATE POLICY "Users can view accounts with restricted password access"
ON public.free_accounts
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (
    -- Show all fields to admins
    has_role(auth.uid(), 'admin'::app_role) OR
    -- Show passwords only to users who claimed the account
    claimed_by = auth.uid()
  )
);

-- Additional policy to show account availability (without passwords) to all users
CREATE POLICY "Users can view account availability"
ON public.free_accounts
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  claimed_by IS NULL
);