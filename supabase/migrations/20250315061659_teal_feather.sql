/*
  # Simplify authentication policies

  1. Changes
    - Drop all existing policies
    - Create new simplified policies using auth.users metadata
    - Remove all triggers and logging functions
    - Add necessary indexes

  2. Security
    - Use auth.users metadata for role checks
    - Maintain basic access control
    - Avoid recursive queries
*/

-- Drop all existing policies, triggers, and functions
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;
DROP TRIGGER IF EXISTS log_access_check_update ON site_users;
DROP FUNCTION IF EXISTS log_access_check();

-- Create basic select policy
CREATE POLICY "basic_select_policy"
ON site_users
FOR SELECT
USING (
  -- Allow users to read their own data
  auth.uid() = id
);

-- Create basic update policy
CREATE POLICY "basic_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Allow users to update their own data
  auth.uid() = id
);

-- Create admin select policy
CREATE POLICY "admin_select_policy"
ON site_users
FOR SELECT
USING (
  -- Check admin status from auth.users metadata
  (SELECT (raw_user_meta_data->>'role')::text = 'admin'
   FROM auth.users
   WHERE auth.users.id = auth.uid())
);

-- Create admin update policy
CREATE POLICY "admin_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Check admin status from auth.users metadata
  (SELECT (raw_user_meta_data->>'role')::text = 'admin'
   FROM auth.users
   WHERE auth.users.id = auth.uid())
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);