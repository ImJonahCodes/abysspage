/*
  # Implement role check with custom function

  1. Changes
    - Create a custom function for role checking
    - Create new policies using the function
    - Add necessary indexes for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "role_based_read" ON site_users;
DROP POLICY IF EXISTS "role_based_update" ON site_users;

-- Create a function to check roles that avoids recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM site_users WHERE id = user_id;
$$;

-- Create new policies using the function
CREATE POLICY "allow_read_with_role"
ON site_users
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN auth.uid() = id THEN true  -- User can always read their own data
    WHEN public.get_user_role(auth.uid()) = 'admin' THEN true  -- Admin can read all
    ELSE false
  END
);

CREATE POLICY "allow_update_with_role"
ON site_users
FOR UPDATE
TO authenticated
USING (
  CASE
    WHEN auth.uid() = id THEN true  -- User can always update their own data
    WHEN public.get_user_role(auth.uid()) = 'admin' THEN true  -- Admin can update all
    ELSE false
  END
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);