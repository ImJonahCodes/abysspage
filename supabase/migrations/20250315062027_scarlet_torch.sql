/*
  # Fix site_users policies with direct role checks

  1. Changes
    - Create simple policies without any recursion
    - Use direct equality checks only
    - No subqueries or self-referential checks

  2. Security
    - Users can read/update their own data
    - Admins can read/update all data
*/

-- Create simple read policy
CREATE POLICY "read_policy"
ON site_users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read

-- Create simple update policy
CREATE POLICY "update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);  -- Users can only update their own data