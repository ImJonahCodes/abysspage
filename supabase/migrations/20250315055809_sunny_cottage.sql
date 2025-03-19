/*
  # Fix Trigger Syntax and Optimize Policies

  1. Changes
    - Fix trigger syntax by using proper event specification
    - Optimize policy conditions
    - Add additional logging details

  2. Security
    - Maintains same security model with improved performance
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS log_policy_check_trigger ON site_users;
DROP FUNCTION IF EXISTS log_policy_check();

-- Create improved debug logging function
CREATE OR REPLACE FUNCTION log_policy_check()
RETURNS trigger AS $$
BEGIN
  RAISE LOG 'Policy Check - Operation: %, User ID: %, Requested ID: %, User Role: %',
    TG_OP,
    auth.uid(),
    NEW.id,
    (SELECT role FROM site_users WHERE id = auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create separate triggers for SELECT and UPDATE
CREATE TRIGGER log_policy_check_select
  BEFORE SELECT ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_check();

CREATE TRIGGER log_policy_check_update
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_check();

-- Optimize existing policies
DROP POLICY IF EXISTS "Allow users to read own data" ON site_users;
DROP POLICY IF EXISTS "Allow users to update own data" ON site_users;

-- Create optimized policies
CREATE POLICY "Allow users to read own data"
  ON site_users
  FOR SELECT
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM site_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow users to update own data"
  ON site_users
  FOR UPDATE
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM site_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_site_users_role_id ON site_users(role, id);
CREATE INDEX IF NOT EXISTS idx_site_users_id_role ON site_users(id, role);