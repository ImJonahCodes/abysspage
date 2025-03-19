/*
  # Fix Authentication Policies

  1. Changes
    - Drop all existing policies
    - Create simple, effective policies for site_users table
    - Add necessary indexes for performance

  2. Security
    - Maintain security while simplifying policy logic
    - Ensure admins can access all records
    - Users can read their own records
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "site_users_read_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;
DROP POLICY IF EXISTS "Allow users to read own data" ON site_users;
DROP POLICY IF EXISTS "Allow users to update own data" ON site_users;

-- Create new simplified policies
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM site_users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM site_users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);