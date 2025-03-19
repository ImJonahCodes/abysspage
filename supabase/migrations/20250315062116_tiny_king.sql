/*
  # Remove all policies from site_users table

  1. Changes
    - Drop ALL existing policies
    - No new policies created
*/

-- Drop all possible policies
DROP POLICY IF EXISTS "read_policy" ON site_users;
DROP POLICY IF EXISTS "update_policy" ON site_users;
DROP POLICY IF EXISTS "users_read_access_policy" ON site_users;
DROP POLICY IF EXISTS "users_update_access_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;
DROP POLICY IF EXISTS "basic_select_policy" ON site_users;
DROP POLICY IF EXISTS "basic_update_policy" ON site_users;
DROP POLICY IF EXISTS "admin_select_policy" ON site_users;
DROP POLICY IF EXISTS "admin_update_policy" ON site_users;

-- Disable RLS on the table
ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;