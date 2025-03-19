/*
  # Drop all site_users policies

  1. Changes
    - Drop all existing policies from site_users table
    - Clean slate for policy management

  2. Security
    - Temporarily removes all policies
    - New policies will need to be created after this
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "users_read_access_policy" ON site_users;
DROP POLICY IF EXISTS "users_update_access_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;
DROP POLICY IF EXISTS "basic_select_policy" ON site_users;
DROP POLICY IF EXISTS "basic_update_policy" ON site_users;
DROP POLICY IF EXISTS "admin_select_policy" ON site_users;
DROP POLICY IF EXISTS "admin_update_policy" ON site_users;