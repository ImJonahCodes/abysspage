/*
  # Fix authentication with optimized security definer function

  1. Changes
    - Drop existing policies and functions
    - Create optimized security definer function
    - Create simplified policy
    - Add necessary indexes

  2. Security
    - Uses security definer function with single query
    - Maintains proper access control
    - Completely avoids recursion
*/

-- Drop existing policies and function
DROP POLICY IF EXISTS "site_users_policy" ON site_users;
DROP FUNCTION IF EXISTS check_user_role(uuid);

-- Create an optimized security definer function that uses a single query
CREATE OR REPLACE FUNCTION check_user_access(check_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM site_users
    WHERE (id = check_id AND id = auth.uid()) -- own record
       OR (id = auth.uid() AND role = 'admin') -- admin access
  );
$$;

-- Disable RLS temporarily
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create simplified policy using the optimized function
CREATE POLICY "site_users_access_policy"
ON site_users
FOR ALL
TO authenticated
USING (check_user_access(id));

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);