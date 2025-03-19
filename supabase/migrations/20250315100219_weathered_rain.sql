/*
  # Add specific user information record

  1. Changes
    - Insert a record into user_information table for a specific user ID
    - Initialize balance and logs
*/

-- Insert user information for specific user if it doesn't exist
INSERT INTO user_information (id, current_balance, orders, balance_logs)
VALUES (
  'a79fd1c0-7598-48b7-a292-7a0d8658848a',
  0,
  ARRAY[]::jsonb[],
  ARRAY[]::jsonb[]
)
ON CONFLICT (id) DO NOTHING;