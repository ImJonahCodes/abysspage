/*
  # Add user information record

  1. Changes
    - Insert a record into user_information table for the authenticated user
    - Initialize balance and logs
*/

-- Insert user information if it doesn't exist
INSERT INTO user_information (id, current_balance, orders, balance_logs)
SELECT 
  auth.uid(),
  0,
  ARRAY[]::jsonb[],
  ARRAY[]::jsonb[]
WHERE NOT EXISTS (
  SELECT 1 FROM user_information WHERE id = auth.uid()
);