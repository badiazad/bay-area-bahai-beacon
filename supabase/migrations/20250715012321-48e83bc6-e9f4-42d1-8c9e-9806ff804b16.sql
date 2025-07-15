-- Create a content management table for page content
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_description TEXT,
  featured_image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for page content
CREATE POLICY "Anyone can view page content" 
ON public.page_content 
FOR SELECT 
USING (true);

CREATE POLICY "Authors can create page content" 
ON public.page_content 
FOR INSERT 
WITH CHECK ((auth.uid() = created_by) AND (has_role(auth.uid(), 'author'::user_role) OR has_role(auth.uid(), 'editor'::user_role) OR has_role(auth.uid(), 'admin'::user_role)));

CREATE POLICY "Authors can update page content" 
ON public.page_content 
FOR UPDATE 
USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'editor'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Editors and admins can delete page content" 
ON public.page_content 
FOR DELETE 
USING (has_role(auth.uid(), 'editor'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default page content
INSERT INTO public.page_content (page_slug, title, content, meta_description, created_by) 
VALUES 
  ('home', 'Home Page', '{"sections": [{"type": "hero", "title": "Welcome to Our Community", "subtitle": "Building Unity Through Love and Service", "content": "Join the San Francisco Baha''i community in building unity, fostering spiritual growth, and serving humanity through love, justice, and fellowship."}]}', 'Welcome to the San Francisco Baha''i Community', (SELECT id FROM auth.users LIMIT 1)),
  ('community-building', 'Community Building', '{"sections": [{"type": "content", "title": "Community Building", "content": "Building stronger communities through meaningful connections and inclusive spaces."}]}', 'Building stronger communities through meaningful connections', (SELECT id FROM auth.users LIMIT 1)),
  ('education', 'Education', '{"sections": [{"type": "content", "title": "Education", "content": "Spiritual education programs for all ages focused on character development and service."}]}', 'Spiritual education programs for all ages', (SELECT id FROM auth.users LIMIT 1)),
  ('social-action', 'Social Action', '{"sections": [{"type": "content", "title": "Social Action", "content": "Working together to address social issues and contribute to the betterment of our communities."}]}', 'Working together to address social issues', (SELECT id FROM auth.users LIMIT 1));