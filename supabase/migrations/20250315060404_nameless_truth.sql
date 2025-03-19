/*
  # Fix Logging Implementation for Updates Only

  1. Changes
    - Remove unsupported SELECT triggers
    - Keep UPDATE triggers only
    - Improve logging function with better error handling
    - Add operation type to logging

  2. Security
    - Maintains existing security model
    - Uses standard row-level triggers
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS log_access_check_select ON site_users;
DROP TRIGGER IF EXISTS log_access_check_update ON site_users;
DROP FUNCTION IF EXISTS log_access_check();

-- Create improved logging function for updates only
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
  RAISE LOG 'Access Check - Operation: UPDATE, User ID: %, Role: %, Old ID: %, New ID: %',
    COALESCE(auth.uid()::text, 'no_user'),
    COALESCE(user_role, 'no_role'),
    COALESCE(OLD.id::text, 'no_id'),
    COALESCE(NEW.id::text, 'no_id');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for UPDATE operations only
CREATE TRIGGER log_access_check_update
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION log_access_check();