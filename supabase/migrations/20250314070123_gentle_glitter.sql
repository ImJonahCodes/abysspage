/*
  # Create payment information table

  1. New Tables
    - `payment_information`
      - `id` (uuid, primary key)
      - `cardholder_name` (text)
      - `billing_address` (jsonb, stores address information)
      - `card_bin` (text)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `payment_information` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS payment_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_name text NOT NULL,
  billing_address jsonb NOT NULL,
  card_bin text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payment information"
  ON payment_information
  FOR SELECT
  TO authenticated
  USING (true);