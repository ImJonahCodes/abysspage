/*
  # Add balance update procedures

  1. Changes
    - Create stored procedures for updating balance and logs
    - Add security definer functions for safe updates
    - Add proper error handling

  2. Security
    - Use security definer to ensure proper access control
    - Set search path for security
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_balance_and_logs(uuid, numeric, jsonb);
DROP FUNCTION IF EXISTS append_balance_log(uuid, jsonb);

-- Function to update balance and append log
CREATE OR REPLACE FUNCTION update_balance_and_logs(
  p_user_id uuid,
  p_amount numeric,
  p_log_entry jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_information
  SET 
    current_balance = current_balance + p_amount,
    balance_logs = array_append(balance_logs, p_log_entry),
    updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User information not found for ID: %', p_user_id;
  END IF;
END;
$$;

-- Function to append log only
CREATE OR REPLACE FUNCTION append_balance_log(
  p_user_id uuid,
  p_log_entry jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_information
  SET 
    balance_logs = array_append(balance_logs, p_log_entry),
    updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User information not found for ID: %', p_user_id;
  END IF;
END;
$$;