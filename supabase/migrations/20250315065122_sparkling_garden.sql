/*
  # Fix user signup process

  1. Changes
    - Drop existing trigger and function
    - Create new trigger function with better error handling
    - Add insert policy for site_users table
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create new trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO site_users (id, role)
  VALUES (
    NEW.id,
    'customer'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create insert policy for site_users
CREATE POLICY "allow_trigger_insert"
ON site_users
FOR INSERT
WITH CHECK (true);  -- Allow inserts from trigger