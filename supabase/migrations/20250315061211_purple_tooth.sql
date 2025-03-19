/*
  # Simplify RLS policies

  1. Changes
    - Drop existing complex policies
    - Create simple, direct policies without recursion
    - Add performance optimizations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create simple select policy
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  -- Users can always read their own data
  auth.uid() = id
);

-- Create simple update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Users can update their own data
  auth.uid() = id
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);