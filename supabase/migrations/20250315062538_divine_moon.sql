/*
  # Fix RLS with minimal policies

  1. Changes
    - Drop all existing policies
    - Temporarily disable RLS
    - Re-enable RLS with minimal policies
    - Focus on basic authentication without role checks
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_read_authenticated" ON site_users;
DROP POLICY IF EXISTS "allow_update_own_data" ON site_users;

-- Temporarily disable RLS
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create minimal policies
CREATE POLICY "authenticated_read"
ON site_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_update"
ON site_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);