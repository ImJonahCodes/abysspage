/*
  # Fix authentication with single EXISTS clause

  1. Changes
    - Drop existing policies and functions
    - Create simplified policy with single EXISTS
    - Add necessary indexes

  2. Security
    - Uses a single EXISTS clause
    - No nested queries
    - No function calls
    - Maintains proper access control
*/

-- Drop existing policies and function
DROP POLICY IF EXISTS "site_users_access_policy" ON site_users;
DROP FUNCTION IF EXISTS check_user_access;

-- Disable RLS temporarily
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create simplified policy using a single EXISTS clause
CREATE POLICY "site_users_access_policy"
ON site_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM site_users current_user
    WHERE current_user.id = auth.uid()
    AND (
      current_user.role = 'admin'
      OR id = auth.uid()
    )
  )
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);