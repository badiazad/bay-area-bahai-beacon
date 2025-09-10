-- Create admin user with specified credentials
-- Note: This will create a user in Supabase Auth with the email admin@bahai-sf.org and password bad00man
-- The user will need to be created through the Supabase Auth dashboard or using the Supabase Admin API

-- First, let's create a function to help with admin user setup
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is a placeholder - actual user creation must be done through Supabase Auth
  -- You can use this in an edge function or through the Supabase dashboard
  RETURN 'Admin user setup function created. Use Supabase Auth dashboard to create user with email: admin@bahai-sf.org and password: bad00man, then assign admin role.';
END;
$$;

-- Ensure we have the admin role in our user_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'author');
  END IF;
END
$$;

-- Create a helper function to assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from profiles table by email
  SELECT user_id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Insert admin role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'Admin role assigned to user: ' || user_email;
END;
$$;