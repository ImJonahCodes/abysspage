/*
  # Fix Trigger Syntax with Event Trigger

  1. Changes
    - Replace row-level triggers with event triggers
    - Improve logging function with better error handling
    - Add operation type to logging
    - Use transaction-level logging instead of row-level

  2. Security
    - Maintains existing security model
    - No changes to policies
*/

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS log_policy_check_select ON site_users;
DROP TRIGGER IF EXISTS log_policy_check_update ON site_users;
DROP FUNCTION IF EXISTS log_policy_check();

-- Create improved logging function
CREATE OR REPLACE FUNCTION log_access_attempt()
RETURNS event_trigger AS $$
DECLARE
  user_role text;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get user role safely
  BEGIN
    SELECT role INTO user_role
    FROM site_users
    WHERE id = current_user_id;
  EXCEPTION WHEN OTHERS THEN
    user_role := 'unknown';
  END;

  -- Log the access attempt
  RAISE LOG 'Access Check - User ID: %, Role: %, Operation: %',
    COALESCE(current_user_id::text, 'no_user'),
    COALESCE(user_role, 'no_role'),
    tg_tag;
END;
$$ LANGUAGE plpgsql;

-- Create event trigger for DDL operations
DROP EVENT TRIGGER IF EXISTS log_access_trigger;
CREATE EVENT TRIGGER log_access_trigger 
  ON ddl_command_end
  EXECUTE FUNCTION log_access_attempt();