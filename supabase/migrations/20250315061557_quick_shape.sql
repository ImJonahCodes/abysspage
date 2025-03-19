/*
  # Simplify RLS policies for site_users table

  1. Changes
    - Drop existing policies
    - Create simple policies that avoid recursion
    - Add necessary indexes for performance

  2. Security
    - Maintain data access control
    - Use auth.users metadata for role checks
    - Allow authenticated users to read their own data
    - Allow admins to read all data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create simple select policy
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  -- Users can read their own data
  auth.uid() = id
  OR
  -- Check admin status directly from auth.users metadata
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Create simple update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Users can update their own data
  auth.uid() = id
  OR
  -- Check admin status directly from auth.users metadata
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);