/*
  # Add stored procedures for balance updates

  1. Changes
    - Create stored procedures for balance updates
    - Add type safety and validation
    - Improve error handling

  2. Security
    - Use security definer functions
    - Validate input parameters
    - Maintain audit trail
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_balance_and_logs(uuid, numeric, jsonb);
DROP FUNCTION IF EXISTS append_balance_log(uuid, jsonb);

-- Create a type for balance log entries
DO $$ BEGIN
  CREATE TYPE balance_log_entry AS (
    type text,
    amount numeric,
    payment_id text,
    timestamp timestamptz
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Function to update balance and append log with type safety
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
DECLARE
  v_log_entry balance_log_entry;
  v_current_balance numeric;
BEGIN
  -- Get current balance
  SELECT current_balance INTO v_current_balance
  FROM user_information
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User information not found for ID: %', p_user_id;
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive: %', p_amount;
  END IF;

  -- Validate log entry format
  BEGIN
    v_log_entry := (
      (p_log_entry->>'type')::text,
      (p_log_entry->>'amount')::numeric,
      (p_log_entry->>'payment_id')::text,
      (p_log_entry->>'timestamp')::timestamptz
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid log entry format: %', p_log_entry;
  END;

  -- Update balance and append log
  UPDATE user_information
  SET 
    current_balance = v_current_balance + p_amount,
    balance_logs = COALESCE(balance_logs, ARRAY[]::jsonb[]) || p_log_entry,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Function to append log only with type safety
CREATE OR REPLACE FUNCTION append_balance_log(
  p_user_id uuid,
  p_log_entry jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_entry balance_log_entry;
BEGIN
  -- Validate log entry format
  BEGIN
    v_log_entry := (
      (p_log_entry->>'type')::text,
      (p_log_entry->>'amount')::numeric,
      (p_log_entry->>'payment_id')::text,
      (p_log_entry->>'timestamp')::timestamptz
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid log entry format: %', p_log_entry;
  END;

  -- Append log
  UPDATE user_information
  SET 
    balance_logs = COALESCE(balance_logs, ARRAY[]::jsonb[]) || p_log_entry,
    updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User information not found for ID: %', p_user_id;
  END IF;
END;
$$;