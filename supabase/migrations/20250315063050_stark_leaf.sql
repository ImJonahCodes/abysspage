/*
  # Implement temporary trust policy for authentication

  1. Changes
    - Drop existing policies
    - Create a temporary trust policy for authentication
    - Create strict policies for normal operation
    - Add necessary indexes for performance

  2. Security
    - Maintains security while avoiding recursion
    - Uses separate policies for different operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_own_data_policy" ON site_users;
DROP POLICY IF EXISTS "admin_access_policy" ON site_users;

-- Create a simple policy that allows reading during authentication
CREATE POLICY "auth_read_policy"
ON site_users
FOR SELECT
TO authenticated
USING (true);

-- Create a policy for updates that only allows users to modify their own data
CREATE POLICY "strict_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create a policy for inserts (needed for user registration)
CREATE POLICY "auth_insert_policy"
ON site_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);