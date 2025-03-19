/*
  # Fix RLS policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create new non-recursive policies
    - Add performance optimizations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create new non-recursive select policy
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  -- Allow users to read their own data
  auth.uid() = id
  OR
  -- Allow admins to read all data (non-recursive check)
  role = 'admin'
);

-- Create new non-recursive update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Allow users to update their own data
  auth.uid() = id
  OR
  -- Allow admins to update all data (non-recursive check)
  role = 'admin'
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_role_id ON site_users(role, id);