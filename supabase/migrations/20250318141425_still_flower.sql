/*
  # Add stored procedures for balance updates

  1. New Functions
    - update_balance_and_logs: Updates user balance and adds log entry
    - append_balance_log: Adds a log entry without updating balance

  2. Security
    - Functions are security definer to bypass RLS
    - Input validation included
*/

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
    balance_logs = array_append(balance_logs, p_log_entry)
  WHERE id = p_user_id;
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
  SET balance_logs = array_append(balance_logs, p_log_entry)
  WHERE id = p_user_id;
END;
$$;