/*
  # Create User Information and Orders Tables

  1. New Tables
    - `user_information`
      - `id` (uuid, primary key, references site_users)
      - `current_balance` (numeric, default 0)
      - `orders` (jsonb array)
      - `balance_logs` (jsonb array)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references site_users)
      - `card_id` (uuid, references payment_info)
      - `amount` (numeric)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add triggers for timestamps
*/

-- Create user_information table
CREATE TABLE IF NOT EXISTS user_information (
  id uuid PRIMARY KEY REFERENCES site_users(id) ON DELETE CASCADE,
  current_balance numeric DEFAULT 0 CHECK (current_balance >= 0),
  orders jsonb[] DEFAULT ARRAY[]::jsonb[],
  balance_logs jsonb[] DEFAULT ARRAY[]::jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES site_users(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES payment_info(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for user_information
CREATE POLICY "Users can view own information"
  ON user_information
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own information"
  ON user_information
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_information
CREATE TRIGGER update_user_information_updated_at
  BEFORE UPDATE ON user_information
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to create user_information record when site_user is created
CREATE OR REPLACE FUNCTION create_user_information()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_information (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_site_user_created
  AFTER INSERT ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_information();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_card_id ON orders(card_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);