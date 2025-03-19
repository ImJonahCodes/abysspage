/*
  # Implement role-based access using auth metadata

  1. Changes
    - Drop existing policies
    - Create new policies using auth.users metadata
    - Add necessary indexes for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_read" ON site_users;
DROP POLICY IF EXISTS "authenticated_update" ON site_users;

-- Create new policies using auth metadata
CREATE POLICY "role_based_read"
ON site_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "role_based_update"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);