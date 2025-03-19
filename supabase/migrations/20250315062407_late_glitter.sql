/*
  # Fix RLS with security definer function

  1. Changes
    - Create a security definer function to check roles
    - Drop existing policies
    - Create new policies using the security definer function
    - Add proper indexes for performance
*/

-- Create a security definer function to check roles
CREATE OR REPLACE FUNCTION check_is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM site_users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "read_with_metadata" ON site_users;
DROP POLICY IF EXISTS "update_with_metadata" ON site_users;

-- Create new policies using the security definer function
CREATE POLICY "read_policy_with_function"
ON site_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  check_is_admin(auth.uid())
);

CREATE POLICY "update_policy_with_function"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  check_is_admin(auth.uid())
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_site_users_role_id ON site_users(role, id);