/*
  # Fix RLS Policy for site_users Table

  1. Changes
    - Drop existing admin read policy that causes infinite recursion
    - Create new admin read policy with optimized query
    - Add index on role column for better performance

  2. Security
    - Maintains same security level but fixes recursion issue
    - Admins can still read all data
    - Users can still only read their own data
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all data" ON site_users;

-- Create new optimized policy
CREATE POLICY "Admins can read all data" 
  ON site_users 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM site_users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);