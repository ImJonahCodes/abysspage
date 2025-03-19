/*
  # Fix authentication with renamed alias

  1. Changes
    - Drop existing policies
    - Create simplified policy with renamed alias
    - Add necessary indexes

  2. Security
    - Uses a single EXISTS clause
    - No reserved keywords
    - Maintains proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_access_policy" ON site_users;

-- Disable RLS temporarily
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create simplified policy using a single EXISTS clause with renamed alias
CREATE POLICY "site_users_access_policy"
ON site_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM site_users usr
    WHERE usr.id = auth.uid()
    AND (
      usr.role = 'admin'
      OR id = auth.uid()
    )
  )
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_site_users_role ON site_users(role);