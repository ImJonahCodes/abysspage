/*
  # Simplify RLS policies to prevent recursion

  1. Changes
    - Drop existing complex policies
    - Create simple, direct policies without recursion
    - Add performance optimizations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create simple select policy using auth.users metadata
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  -- Users can read their own data
  auth.uid() = id
  OR
  -- Admins can read all data (using auth.users metadata)
  (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
   FROM auth.users 
   WHERE auth.users.id = auth.uid())
);

-- Create simple update policy using auth.users metadata
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Users can update their own data
  auth.uid() = id
  OR
  -- Admins can update all data (using auth.users metadata)
  (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
   FROM auth.users 
   WHERE auth.users.id = auth.uid())
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);