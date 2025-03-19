/*
  # Create site users table and policies

  1. New Tables
    - `site_users`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, either 'admin' or 'customer')
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `site_users` table
    - Add policies for:
      - Users can read their own data
      - Admins can read all data
      - Users can update their own data
      - Admins can update any data
*/

-- Create the site_users table
CREATE TABLE IF NOT EXISTS site_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" 
  ON site_users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all data" 
  ON site_users 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM site_users WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can update own data" 
  ON site_users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any data" 
  ON site_users 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM site_users WHERE role = 'admin'
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO site_users (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_site_users_updated_at
  BEFORE UPDATE ON site_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();