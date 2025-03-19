/*
  # Implement simplified role check

  1. Changes
    - Create a new function for role checking with better isolation
    - Create simplified policies
    - Add necessary indexes for performance
*/

-- Drop existing policies and functions
DROP POLICY IF EXISTS "allow_read_with_role" ON site_users;
DROP POLICY IF EXISTS "allow_update_with_role" ON site_users;
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Create a more isolated function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role
  FROM site_users
  WHERE id = auth.uid();
  
  RETURN _role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create simplified policies
CREATE POLICY "basic_read_policy"
ON site_users
FOR SELECT
TO authenticated
USING (
  -- Either it's the user's own record or they're an admin
  auth.uid() = id OR is_admin()
);

CREATE POLICY "basic_update_policy"
ON site_users
FOR UPDATE
TO authenticated
USING (
  -- Either it's the user's own record or they're an admin
  auth.uid() = id OR is_admin()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_site_users_id_role ON site_users(id, role);