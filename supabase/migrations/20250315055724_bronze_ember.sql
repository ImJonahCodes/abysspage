/*
  # Fix RLS Policy with Debugging

  1. Changes
    - Drop existing policies
    - Create simplified policies with logging
    - Add function for policy debugging
    - Add indexes for performance

  2. Security
    - Maintains same security model
    - Adds logging for troubleshooting
*/

-- Create debug logging function
CREATE OR REPLACE FUNCTION log_policy_check()
RETURNS trigger AS $$
BEGIN
  RAISE LOG 'Policy Check - User ID: %, Requested ID: %, User Role: %',
    auth.uid(),
    NEW.id,
    (SELECT role FROM site_users WHERE id = auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON site_users;
DROP POLICY IF EXISTS "Admins can read all data" ON site_users;
DROP POLICY IF EXISTS "Users can update own data" ON site_users;
DROP POLICY IF EXISTS "Admins can update any data" ON site_users;

-- Create simplified policies
CREATE POLICY "Allow users to read own data"
  ON site_users
  FOR SELECT
  USING (
    auth.uid() = id
    OR 
    (SELECT role FROM site_users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow users to update own data"
  ON site_users
  FOR UPDATE
  USING (
    auth.uid() = id
    OR 
    (SELECT role FROM site_users WHERE id = auth.uid()) = 'admin'
  );

-- Create trigger for logging
DROP TRIGGER IF EXISTS log_policy_check_trigger ON site_users;
CREATE TRIGGER log_policy_check_trigger
  BEFORE SELECT OR UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_check();

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_site_users_role_id ON site_users(role, id);