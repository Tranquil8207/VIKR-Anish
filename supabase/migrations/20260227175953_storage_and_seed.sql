-- Ensure storage schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the Storage bucket for documents if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure_documents', 'secure_documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for the storage bucket (secure_documents)
-- 1. Admins can upload, update, delete
DROP POLICY IF EXISTS "Admins can manage documents in storage" ON storage.objects;
CREATE POLICY "Admins can manage documents in storage"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'secure_documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 2. Authenticated users can ONLY SELECT (download/view)
DROP POLICY IF EXISTS "Authenticated users can read documents" ON storage.objects;
CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'secure_documents' AND
    auth.role() = 'authenticated'
  );

-- -------------------------------------------------------------
-- SEED DATA
-- -------------------------------------------------------------

-- Note: We only insert seed data if no data exists, to avoid duplicating rows on subsequent pushes.
DO $$
DECLARE
    prod1_id UUID;
    prod2_id UUID;
    prod3_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        
        -- Insert Products one by one to capture their IDs safely
        INSERT INTO public.products (sku, name, description, category, ph_level, is_active)
        VALUES ('VKR-CLN-100', 'Vikr All-Purpose Cleaner', 'Industrial grade cleaner for heavy machinery.', 'Cleaning', 11.5, true)
        RETURNING id INTO prod1_id;

        INSERT INTO public.products (sku, name, description, category, ph_level, is_active)
        VALUES ('VKR-SFU-200', 'Vikr Surface Protectant', 'High-end coating that repels water and prevents rust.', 'Protection', 7.0, true)
        RETURNING id INTO prod2_id;

        INSERT INTO public.products (sku, name, description, category, ph_level, is_active)
        VALUES ('VKR-HCL-300', 'Vikr Industrial Acid Wash', 'Heavy duty acid wash for pre-treatment.', 'Acidic', 2.5, true)
        RETURNING id INTO prod3_id;

        -- Insert Documents
        INSERT INTO public.documents (product_id, title, file_url, category, valid_regions)
        VALUES 
        -- Global Docs
        (prod1_id, 'TDS - Vikr All-Purpose Cleaner (Global)', 'demo/tds-cleaner-global.pdf', 'TDS', '{GLOBAL}'),
        (prod1_id, 'MSDS - Vikr All-Purpose Cleaner (Global)', 'demo/msds-cleaner-global.pdf', 'MSDS', '{GLOBAL}'),
        
        -- Regional Docs
        (prod2_id, 'TDS - Surface Protectant (MENA)', 'demo/tds-protectant-mena.pdf', 'TDS', '{MENA}'),
        (prod2_id, 'Certificate - Surface Protectant (MENA)', 'demo/cert-protectant-mena.pdf', 'CERTIFICATE', '{MENA}'),
        (prod2_id, 'TDS - Surface Protectant (EU)', 'demo/tds-protectant-eu.pdf', 'TDS', '{EU}'),
        
        (prod3_id, 'MSDS - Acid Wash (APAC)', 'demo/msds-acid-apac.pdf', 'MSDS', '{APAC}'),
        (prod3_id, 'Manual - Acid Handling Guidelines (Global)', 'demo/manual-acid-handling.pdf', 'MANUAL', '{GLOBAL}');
        
    END IF;
END $$;
