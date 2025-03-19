/*
  # Implement role check with SECURITY DEFINER bypass

  1. Changes
    - Create a new function that bypasses RLS to check roles
    - Create simplified policies using the new function
    - Add necessary indexes for performance
*/

-- Drop existing policies and functions
DROP POLICY IF EXISTS "basic_read_policy" ON site_users;
DROP POLICY IF EXISTS "basic_update_policy" ON site_users;
DROP FUNCTION IF EXISTS is_admin();

-- Create a function to safely get user role that bypasses RLS
CREATE OR REPLACE FUNCTION get_user_role_bypass(_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM site_users WHERE id = _user_id;
$$;

-- Create simplified policies using the bypass function
CREATE POLICY "allow_read_policy"
ON site_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  get_user_role_bypass(auth.uid()) = 'admin'
);

CREATE POLICY "allow_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  get_user_role_bypass(auth.uid()) = 'admin'
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id_role ON site_users(id, role);