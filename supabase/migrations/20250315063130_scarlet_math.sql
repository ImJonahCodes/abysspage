/*
  # Implement secure role check with security definer function

  1. Changes
    - Drop existing policies
    - Create a security definer function that bypasses RLS
    - Create simplified policies
    - Add necessary indexes for performance

  2. Security
    - Uses security definer function to safely check roles
    - Maintains proper access control
    - Avoids recursion completely
*/

-- Drop existing policies
DROP POLICY IF EXISTS "auth_read_policy" ON site_users;
DROP POLICY IF EXISTS "strict_update_policy" ON site_users;
DROP POLICY IF EXISTS "auth_insert_policy" ON site_users;

-- Create a security definer function that completely bypasses RLS
CREATE OR REPLACE FUNCTION check_user_role(check_id uuid)
RETURNS TABLE (
  is_admin boolean,
  is_own_record boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT role = 'admin' FROM site_users WHERE id = auth.uid()), false),
    auth.uid() = check_id;
END;
$$;

-- Disable RLS temporarily
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create simplified policies using the security definer function
CREATE POLICY "site_users_policy"
ON site_users
FOR ALL
TO authenticated
USING (
  (SELECT is_admin OR is_own_record FROM check_user_role(id))
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);