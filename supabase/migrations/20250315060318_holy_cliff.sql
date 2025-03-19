/*
  # Fix Logging Implementation with Regular Triggers

  1. Changes
    - Replace event trigger with regular row-level triggers
    - Improve logging function with better error handling
    - Add operation type to logging
    - Use transaction-level logging

  2. Security
    - Uses standard row-level triggers that don't require superuser privileges
    - Maintains existing security model
*/

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS log_policy_check_select ON site_users;
DROP TRIGGER IF EXISTS log_policy_check_update ON site_users;
DROP FUNCTION IF EXISTS log_policy_check();
DROP FUNCTION IF EXISTS log_access_attempt();

-- Create improved logging function
CREATE OR REPLACE FUNCTION log_access_check()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role safely
  BEGIN
    SELECT role INTO user_role
    FROM site_users
    WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_role := 'unknown';
  END;

  -- Log the access attempt
  RAISE LOG 'Access Check - Operation: %, User ID: %, Role: %, Target ID: %',
    TG_OP,
    COALESCE(auth.uid()::text, 'no_user'),
    COALESCE(user_role, 'no_role'),
    COALESCE(NEW.id::text, OLD.id::text, 'no_id');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for SELECT and UPDATE operations
CREATE TRIGGER log_access_check_select
  BEFORE SELECT ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_access_check();

CREATE TRIGGER log_access_check_update
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_access_check();