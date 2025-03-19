/*
  # Fix RLS policies for site_users table

  1. Changes
    - Drop existing policies
    - Create simple read policy that allows all authenticated users to read
    - Create update policy that checks role directly from site_users table
    - Add necessary indexes for performance

  2. Security
    - All authenticated users can read (needed for auth flow)
    - Updates restricted to own record or admin users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_read_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

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
  auth.uid() = id  -- Users can update their own records
  OR 
  (SELECT role FROM site_users WHERE id = auth.uid()) = 'admin'  -- Admins can update any record
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);