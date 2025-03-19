/*
  # Fix authentication policies for site_users table

  1. Changes
    - Drop existing policies
    - Create separate policies for reading and writing
    - Allow reading of role information during authentication
    - Maintain strict control over updates

  2. Security
    - Anyone can read role information (needed for auth)
    - Only users can update their own records
    - Admins can update any record
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_access_policy" ON site_users;

-- Create a permissive read policy
CREATE POLICY "site_users_read_policy"
ON site_users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read

-- Create a strict update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id  -- Users can only update their own records
  OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);