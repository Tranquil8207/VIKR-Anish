-- Add Missing Fields to Existing Tables
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS pdf_resource_url TEXT;
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS market_segment TEXT;

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- New Enum for Media Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO');
    END IF;
END
$$;

-- New Table: Product Media (for "Before & After" visuals)
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    type media_type NOT NULL DEFAULT 'IMAGE',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- New Table: Meetings & Onboarding Log
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    meet_link TEXT,
    recording_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Product Media RLS
CREATE POLICY "Anyone can view product media"
  ON public.product_media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_media.product_id AND is_active = true)
  );

CREATE POLICY "Admins manage product media"
  ON public.product_media FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Meetings RLS
CREATE POLICY "Users view own meetings"
  ON public.meetings FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins manage meetings"
  ON public.meetings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
