/*
  # Create checked cards table and policies

  1. New Tables
    - `checked_cards`
      - `id` (uuid, primary key)
      - `card_id` (uuid, references payment_info)
      - `checked_at` (timestamp with timezone)
      - `checked_by` (uuid, references site_users)
      - `notes` (text)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add indexes for performance
*/

-- Create checked_cards table
CREATE TABLE IF NOT EXISTS checked_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES payment_info(id) NOT NULL,
  checked_at timestamptz DEFAULT now(),
  checked_by uuid REFERENCES site_users(id) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE checked_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view checked cards"
  ON checked_cards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert checked cards"
  ON checked_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = checked_by);

-- Create indexes for better performance
CREATE INDEX idx_checked_cards_card_id ON checked_cards(card_id);
CREATE INDEX idx_checked_cards_checked_by ON checked_cards(checked_by);
CREATE INDEX idx_checked_cards_checked_at ON checked_cards(checked_at);