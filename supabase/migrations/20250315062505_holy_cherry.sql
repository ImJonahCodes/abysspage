/*
  # Simplify RLS with basic policies

  1. Changes
    - Drop existing policies
    - Create simple policies without role checks
    - Maintain basic security while avoiding recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "read_policy_with_function" ON site_users;
DROP POLICY IF EXISTS "update_policy_with_function" ON site_users;

-- Drop the function as we won't need it
DROP FUNCTION IF EXISTS check_is_admin(uuid);

-- Create a simple read policy that allows all authenticated users to read
CREATE POLICY "allow_read_authenticated"
ON site_users
FOR SELECT
TO authenticated
USING (true);

-- Create a simple update policy that only allows users to update their own data
CREATE POLICY "allow_update_own_data"
ON site_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);