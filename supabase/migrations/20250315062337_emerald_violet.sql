/*
  # Fix policies using auth metadata

  1. Changes
    - Drop existing policies
    - Create new policies that use auth.users metadata for role checks
    - Avoid recursion by not querying site_users table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "read_own_data" ON site_users;
DROP POLICY IF EXISTS "update_own_data" ON site_users;

-- Create read policy using auth metadata
CREATE POLICY "read_with_metadata"
ON site_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- Create update policy using auth metadata
CREATE POLICY "update_with_metadata"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  (auth.jwt() ->> 'role')::text = 'admin'
);