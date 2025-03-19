/*
  # Update RLS policies to allow public read access

  1. Changes
    - Drop existing policies
    - Create public read policy
    - Maintain strict update policy
    - Add necessary indexes for performance

  2. Security
    - Allow public read access (needed for auth flow)
    - Updates still restricted to own record or admin users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_read_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create a public read policy
CREATE POLICY "site_users_read_policy"
ON site_users
FOR SELECT
USING (true);  -- Allow public read access

-- Create a strict update policy
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id  -- Users can update their own records
  OR 
  (SELECT role FROM site_users WHERE id = auth.uid()) = 'admin'  -- Admins can update any record
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);