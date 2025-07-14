-- Remove unused columns from events table
ALTER TABLE public.events 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude,
DROP COLUMN IF EXISTS max_attendees,
DROP COLUMN IF EXISTS tags;

-- Update RLS policies to allow anonymous users to view published events
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON public.events;

-- Create new policy for anonymous access to published events
CREATE POLICY "Anyone can view published events" 
ON public.events 
FOR SELECT 
USING (status = 'published'::event_status);

-- Create policy for authenticated users to view all events (including drafts)
CREATE POLICY "Authenticated users can view all events" 
ON public.events 
FOR SELECT 
TO authenticated
USING (true);