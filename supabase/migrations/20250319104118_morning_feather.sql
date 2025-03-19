/*
  # Create sold cards table

  1. New Tables
    - `sold_cards`
      - `id` (uuid, primary key)
      - `card_id` (uuid, references payment_info)
      - `sold_at` (timestamp with timezone)
      - `sold_by` (uuid, references site_users)
      - `notes` (text, optional)

  2. Security
    - Enable RLS on `sold_cards` table
    - Add policies for authenticated users
*/

-- Create sold_cards table
CREATE TABLE IF NOT EXISTS sold_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES payment_info(id) NOT NULL,
  sold_at timestamptz DEFAULT now(),
  sold_by uuid REFERENCES site_users(id) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sold_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view sold cards"
  ON sold_cards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sold cards"
  ON sold_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sold_by);

-- Create index for better performance
CREATE INDEX idx_sold_cards_card_id ON sold_cards(card_id);
CREATE INDEX idx_sold_cards_sold_by ON sold_cards(sold_by);
CREATE INDEX idx_sold_cards_sold_at ON sold_cards(sold_at);