/*
  # Simplify RLS policies for site_users table

  1. Changes
    - Drop existing policies
    - Create a simple policy that allows all authenticated users to read all data
    - Maintain update restrictions for security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_update_policy" ON site_users;

-- Create simple read policy that allows all authenticated users to read all data
CREATE POLICY "site_users_select_policy"
ON site_users
FOR SELECT
USING (auth.uid() IS NOT NULL);  -- Allow any authenticated user to read

-- Create update policy that maintains security
CREATE POLICY "site_users_update_policy"
ON site_users
FOR UPDATE
USING (
  -- Users can update their own data
  auth.uid() = id
  OR
  -- Admins can update all data (using auth.users metadata)
  (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
   FROM auth.users 
   WHERE auth.users.id = auth.uid())
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_id ON site_users(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);