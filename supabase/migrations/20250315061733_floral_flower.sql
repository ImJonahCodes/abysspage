/*
  # Simplify site_users policies

  1. Changes
    - Drop all existing policies
    - Create new simplified policies using site_users table
    - Remove metadata checks
    - Maintain proper access control

  2. Security
    - Users can read/update their own data
    - Admins can read/update all data
    - Use direct role checks from site_users table
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "basic_select_policy" ON site_users;
DROP POLICY IF EXISTS "basic_update_policy" ON site_users;
DROP POLICY IF EXISTS "admin_select_policy" ON site_users;
DROP POLICY IF EXISTS "admin_update_policy" ON site_users;

-- Create new simplified select policy
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  -- Users can read their own data
  auth.uid() = id
  OR
  -- Admins can read all data
  (SELECT role = 'admin' FROM site_users WHERE id = auth.uid())
);

-- Create new simplified update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Users can update their own data
  auth.uid() = id
  OR
  -- Admins can update all data
  (SELECT role = 'admin' FROM site_users WHERE id = auth.uid())
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);