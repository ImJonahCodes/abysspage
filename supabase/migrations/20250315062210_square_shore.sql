/*
  # Add basic policies to site_users table

  1. Changes
    - Enable RLS
    - Add simple read policy for authenticated users
    - Add simple update policy for own data
*/

-- Enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create simple read policy for authenticated users
CREATE POLICY "read_own_data"
ON site_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Create simple update policy for own data
CREATE POLICY "update_own_data"
ON site_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
);