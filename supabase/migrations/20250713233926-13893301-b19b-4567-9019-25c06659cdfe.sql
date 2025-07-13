-- Create user_role enum type
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'author');

-- Update the handle_new_user function to use the correct enum type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.email
  );
  
  -- Give first user admin role, others get author role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::user_role
      ELSE 'author'::user_role
    END
  );
  
  RETURN NEW;
END;
$$;