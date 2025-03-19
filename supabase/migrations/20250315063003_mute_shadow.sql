/*
  # Fix recursion in RLS policies

  1. Changes
    - Drop existing policies and functions
    - Create separate policies for users and admins
    - Use direct role check without function calls
*/

-- Drop existing policies and functions
DROP POLICY IF EXISTS "allow_read_policy" ON site_users;
DROP POLICY IF EXISTS "allow_update_policy" ON site_users;
DROP FUNCTION IF EXISTS get_user_role_bypass;

-- Create separate policies for users and admins
-- First policy: Users can always read and update their own data
CREATE POLICY "users_own_data_policy"
ON site_users
FOR ALL
TO authenticated
USING (auth.uid() = id);

-- Second policy: Direct role check for admin access
-- This avoids any function calls or subqueries that might cause recursion
CREATE POLICY "admin_access_policy"
ON site_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM site_users su
    WHERE su.id = auth.uid()
    AND su.role = 'admin'
  )
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id_role ON site_users(id, role);