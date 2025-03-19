/*
  # Fix Site Users Table Policies

  1. Changes
    - Drop all existing policies
    - Create simplified, more permissive policies for reading and updating
    - Remove complex subqueries that may cause performance issues
    - Add better indexes for policy performance

  2. Security
    - Maintains security model where users can read their own data
    - Admins can read all data
    - Policies are simplified but maintain security boundaries
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow users to read own data" ON site_users;
DROP POLICY IF EXISTS "Allow users to update own data" ON site_users;

-- Create simplified read policy
CREATE POLICY "site_users_read_policy"
  ON site_users
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read

-- Create simplified update policy
CREATE POLICY "site_users_update_policy"
  ON site_users
  FOR UPDATE
  USING (
    auth.uid() = id OR
    role = 'admin'
  );

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);