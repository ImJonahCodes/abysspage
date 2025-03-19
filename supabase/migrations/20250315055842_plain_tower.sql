/*
  # Fix Trigger Syntax and Optimize Logging

  1. Changes
    - Fix trigger syntax by creating separate triggers for each operation
    - Improve logging function with better error handling
    - Add operation type to logging

  2. Security
    - Maintains existing security model
    - No changes to policies
*/

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS log_policy_check_select ON site_users;
DROP TRIGGER IF EXISTS log_policy_check_update ON site_users;
DROP FUNCTION IF EXISTS log_policy_check();

-- Create improved logging function with error handling
CREATE OR REPLACE FUNCTION log_policy_check()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role with error handling
  BEGIN
    SELECT role INTO user_role
    FROM site_users
    WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_role := 'unknown';
  END;

  -- Log the access attempt
  RAISE LOG 'Policy Check - Operation: %, User ID: %, Requested ID: %, User Role: %',
    TG_OP,
    COALESCE(auth.uid()::text, 'no_user'),
    COALESCE(NEW.id::text, 'no_id'),
    COALESCE(user_role, 'no_role');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create individual triggers for each operation
CREATE TRIGGER log_policy_check_select
  BEFORE SELECT ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_check();

CREATE TRIGGER log_policy_check_update
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_policy_check();