/*
  # Fix RLS policies with non-recursive approach

  1. Changes
    - Drop all existing policies
    - Create new simplified policies without recursion
    - Add performance optimizations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create new simplified select policy
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  CASE
    -- Check if the user is accessing their own data
    WHEN auth.uid() = id THEN true
    -- Check if the requesting user is an admin
    WHEN EXISTS (
      SELECT 1 
      FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    ) THEN true
    ELSE false
  END
);

-- Create new simplified update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  CASE
    -- Check if the user is updating their own data
    WHEN auth.uid() = id THEN true
    -- Check if the requesting user is an admin
    WHEN EXISTS (
      SELECT 1 
      FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    ) THEN true
    ELSE false
  END
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);