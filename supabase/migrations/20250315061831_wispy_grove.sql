/*
  # Update site_users policies with unique names

  1. Changes
    - Drop existing policies
    - Create new policies with unique names
    - Maintain same functionality but avoid naming conflicts

  2. Security
    - Users can read/update their own data
    - Admins can read/update all data
    - Direct role checks from site_users table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create new select policy with unique name
CREATE POLICY "users_read_access_policy"
ON site_users
FOR SELECT
USING (
  -- Users can read their own data
  auth.uid() = id
  OR
  -- Admins can read all data
  (SELECT role = 'admin' FROM site_users WHERE id = auth.uid())
);

-- Create new update policy with unique name
CREATE POLICY "users_update_access_policy"
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