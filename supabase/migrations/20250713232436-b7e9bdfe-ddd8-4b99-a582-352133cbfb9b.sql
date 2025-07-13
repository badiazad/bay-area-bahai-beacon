-- Create enum for event calendar types
CREATE TYPE public.event_calendar AS ENUM ('devotional', 'youth_class', 'childrens_class', 'study_circle', 'holy_day', 'community_gathering', 'other');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled');

-- Create enum for event recurrence
CREATE TYPE public.event_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  calendar_type event_calendar NOT NULL DEFAULT 'community_gathering',
  status event_status NOT NULL DEFAULT 'draft',
  featured_image_url TEXT,
  host_name TEXT NOT NULL,
  host_email TEXT NOT NULL,
  max_attendees INTEGER,
  tags TEXT[],
  
  -- Recurring event fields
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_type event_recurrence NOT NULL DEFAULT 'none',
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  parent_event_id UUID REFERENCES public.events(id),
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  notes TEXT,
  reminder_email BOOLEAN DEFAULT true,
  reminder_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, email)
);

-- Create event reminders tracking table
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'host_notification', 'attendee_reminder'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (status = 'published');

CREATE POLICY "Authenticated users can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authors can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND 
  (has_role(auth.uid(), 'author') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Authors can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by OR 
  has_role(auth.uid(), 'editor') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Editors and admins can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- RSVP policies
CREATE POLICY "Anyone can view RSVPs for published events"
ON public.event_rsvps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_rsvps.event_id 
    AND events.status = 'published'
  )
);

CREATE POLICY "Anyone can create RSVPs for published events"
ON public.event_rsvps
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_rsvps.event_id 
    AND events.status = 'published'
  )
);

CREATE POLICY "Admins and editors can manage all RSVPs"
ON public.event_rsvps
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- Event reminders policies
CREATE POLICY "Admins can view all reminders"
ON public.event_reminders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create reminders"
ON public.event_reminders
FOR INSERT
WITH CHECK (true);

-- Create function to generate event slug
CREATE OR REPLACE FUNCTION public.generate_event_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(trim(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check for duplicates and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create function to automatically set slug before insert
CREATE OR REPLACE FUNCTION public.set_event_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_event_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic slug generation
CREATE TRIGGER set_event_slug_trigger
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_event_slug();

-- Create trigger for updating updated_at on events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_calendar_type ON public.events(calendar_type);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_email ON public.event_rsvps(email);