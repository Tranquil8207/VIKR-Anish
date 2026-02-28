-- Create tables for Phase 2: Education & Engagement
-- `training_modules` and `announcements`

CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INT, -- Duration in seconds
  valid_regions territory[] NOT NULL DEFAULT '{GLOBAL}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  valid_regions territory[] NOT NULL DEFAULT '{GLOBAL}',
  date_posted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 3: Sales Enablement & Administrative Control
-- `support_tickets`

CREATE TABLE public.support_tickets (
  ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- e.g. Pricing, Technical, Docs
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at on support_tickets
CREATE OR REPLACE FUNCTION public.set_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_support_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_support_tickets_updated_at();

-- ENABLE RLS
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 1. Training Modules RLS
CREATE POLICY "Users view training by region"
  ON public.training_modules FOR SELECT
  USING (
    'GLOBAL' = ANY(valid_regions) OR
    (SELECT territory_code FROM public.profiles WHERE id = auth.uid()) = ANY(valid_regions)
  );

CREATE POLICY "Admins manage training"
  ON public.training_modules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 2. Announcements RLS
CREATE POLICY "Users view announcements by region"
  ON public.announcements FOR SELECT
  USING (
    'GLOBAL' = ANY(valid_regions) OR
    (SELECT territory_code FROM public.profiles WHERE id = auth.uid()) = ANY(valid_regions)
  );

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 3. Support Tickets RLS
CREATE POLICY "Users manage own tickets"
  ON public.support_tickets FOR ALL
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins manage all tickets"
  ON public.support_tickets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Seed Data for Phase 2 & 3
DO $$
DECLARE
    dummy_partner UUID;
BEGIN
    SELECT id INTO dummy_partner FROM auth.users LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM public.training_modules LIMIT 1) THEN
        INSERT INTO public.training_modules (title, video_url, category, duration, valid_regions)
        VALUES 
        ('Sales Pitching 101: Vikr All-Purpose Cleaner', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Sales', 360, '{GLOBAL}'),
        ('Safety Protocol: Handling Acid Wash', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Safety', 420, '{GLOBAL}'),
        ('UAE Regulatory Update Q2', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Onboarding', 120, '{MENA}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1) THEN
        INSERT INTO public.announcements (title, content, is_pinned, valid_regions)
        VALUES 
        ('New Product Launch: VIKR-X90', 'The new high-capacity protectant is available for ordering next week.', true, '{GLOBAL}'),
        ('Maintenance Schedule', 'The system will be down for 2 hours on Sunday for routine updates.', false, '{GLOBAL}'),
        ('Region specific: Dubai Summit', 'Join us next week for the regional summit in Dubai.', false, '{MENA}');
    END IF;

    -- Only insert ticket if we actually have a user to attach it to
    IF dummy_partner IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.support_tickets LIMIT 1) THEN
        INSERT INTO public.support_tickets (partner_id, category, description, status)
        VALUES 
        (dummy_partner, 'Technical', 'Need clarification on mixing ratio for VKR-CLN-100', 'OPEN'),
        (dummy_partner, 'Pricing', 'Requesting latest bulk discount sheet for MENA', 'RESOLVED');
    END IF;
END $$;
