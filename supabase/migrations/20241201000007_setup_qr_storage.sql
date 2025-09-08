-- Create qr-codes storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-codes',
  'qr-codes',
  true,
  5242880, -- 5MB limit
  ARRAY['image/svg+xml', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for qr-codes bucket
-- Allow authenticated users to upload QR codes (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload QR codes'
  ) THEN
    CREATE POLICY "Authenticated users can upload QR codes"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'qr-codes');
  END IF;
END $$;

-- Allow public read access to QR codes (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view QR codes'
  ) THEN
    CREATE POLICY "Public can view QR codes"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'qr-codes');
  END IF;
END $$;

-- Allow authenticated users to update their own QR codes (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own QR codes'
  ) THEN
    CREATE POLICY "Users can update their own QR codes"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'qr-codes' AND owner = auth.uid());
  END IF;
END $$;

-- Allow authenticated users to delete their own QR codes (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own QR codes'
  ) THEN
    CREATE POLICY "Users can delete their own QR codes"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'qr-codes' AND owner = auth.uid());
  END IF;
END $$;
