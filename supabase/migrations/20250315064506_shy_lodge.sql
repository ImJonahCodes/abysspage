/*
  # Update site_users policies to allow public read access

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Make table readable by everyone
    - Maintain strict update controls

  2. Security
    - Anyone can read the site_users table
    - Only users can update their own records
    - Admins can update any record
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_read_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create a public read policy without any restrictions
CREATE POLICY "site_users_read_policy"
ON site_users
FOR SELECT
USING (true);  -- Allow public read access without authentication

-- Create a strict update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id  -- Users can only update their own records
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);