-- ===== Seed Data for Development
-- This file contains initial data for local development

-- Note: In production, you would typically not have seed data
-- This is only for local development and testing

-- ===== Sample Organizations
INSERT INTO public.orgs (id, name, plan, stripe_customer_id) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Corp', 'free', NULL),
  ('550e8400-e29b-41d4-a716-446655440010', 'Tech Startup Inc', 'pro', 'cus_pro_tech123'),
  ('550e8400-e29b-41d4-a716-446655440020', 'Local Restaurant', 'free', NULL),
  ('550e8400-e29b-41d4-a716-446655440030', 'Event Management Co', 'pro', 'cus_pro_events456'),
  ('550e8400-e29b-41d4-a716-446655440040', 'Archived Business', 'free', NULL);

-- ===== Sample Users
-- Create auth users for all our test users
DO $$
DECLARE
  v_user_id UUID;
  v_email   TEXT;
  v_user_rec RECORD;
BEGIN
  -- Array of users to create
  FOR v_user_rec IN SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'demo@example.com'),
    ('550e8400-e29b-41d4-a716-446655440011', 'sarah@techstartup.com'),
    ('550e8400-e29b-41d4-a716-446655440021', 'mike@restaurant.com'),
    ('550e8400-e29b-41d4-a716-446655440031', 'emma@events.com'),
    ('550e8400-e29b-41d4-a716-446655440041', 'john@archived.com'),
    ('550e8400-e29b-41d4-a716-446655440051', 'lisa@techstartup.com'),
    ('550e8400-e29b-41d4-a716-446655440061', 'david@events.com')
  ) AS t(id, email) LOOP
    
    v_user_id := v_user_rec.id;
    v_email := v_user_rec.email;
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      v_user_id,
      v_email,
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      '{}'::jsonb,
      NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create identity for email provider
    INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, created_at, updated_at)
    VALUES (
      v_user_id,
      v_user_id,
      'email',
      v_email,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Insert into public.users
INSERT INTO public.users (id, email, name, avatar_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'demo@example.com', 'Demo User', NULL),
  ('550e8400-e29b-41d4-a716-446655440011', 'sarah@techstartup.com', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'),
  ('550e8400-e29b-41d4-a716-446655440021', 'mike@restaurant.com', 'Mike Rodriguez', NULL),
  ('550e8400-e29b-41d4-a716-446655440031', 'emma@events.com', 'Emma Thompson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
  ('550e8400-e29b-41d4-a716-446655440041', 'john@archived.com', 'John Smith', NULL),
  ('550e8400-e29b-41d4-a716-446655440051', 'lisa@techstartup.com', 'Lisa Park', NULL),
  ('550e8400-e29b-41d4-a716-446655440061', 'david@events.com', 'David Wilson', NULL);

-- ===== Sample Organization Memberships
INSERT INTO public.org_members (org_id, user_id, role) VALUES 
  -- Demo Corp (Free plan)
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
  
  -- Tech Startup Inc (Pro plan)
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440011', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440051', 'admin'),
  
  -- Local Restaurant (Free plan)
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440021', 'owner'),
  
  -- Event Management Co (Pro plan)
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440031', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440061', 'editor'),
  
  -- Archived Business (Free plan)
  ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440041', 'owner');

-- ===== Sample QR Codes
INSERT INTO public.qr_codes (id, org_id, name, slug, current_target_url, status, created_by) VALUES 
  -- Demo Corp QRs
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Demo QR Code', 'demo-qr', 'https://example.com', 'active', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- Tech Startup Inc QRs
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440010', 'Product Landing Page', 'product-landing', 'https://techstartup.com/product', 'active', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', 'Support Page', 'support', 'https://techstartup.com/support', 'active', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', 'Old Marketing Page', 'old-marketing', 'https://techstartup.com/old', 'archived', '550e8400-e29b-41d4-a716-446655440011'),
  
  -- Local Restaurant QRs
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440020', 'Menu QR', 'menu', 'https://restaurant.com/menu', 'active', '550e8400-e29b-41d4-a716-446655440021'),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440020', 'Reservation QR', 'reserve', 'https://restaurant.com/reserve', 'active', '550e8400-e29b-41d4-a716-446655440021'),
  
  -- Event Management Co QRs
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440030', 'Event Registration', 'register', 'https://events.com/register', 'active', '550e8400-e29b-41d4-a716-446655440031'),
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440030', 'Event Schedule', 'schedule', 'https://events.com/schedule', 'active', '550e8400-e29b-41d4-a716-446655440031'),
  ('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440030', 'Speaker Bios', 'speakers', 'https://events.com/speakers', 'active', '550e8400-e29b-41d4-a716-446655440031'),
  
  -- Archived Business QRs
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440040', 'Old Website', 'old-website', 'https://archived.com', 'archived', '550e8400-e29b-41d4-a716-446655440041');

-- ===== Sample QR Versions (showing URL changes over time)
INSERT INTO public.qr_versions (id, qr_id, target_url, note, created_by) VALUES 
  -- Demo QR versions
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com', 'Initial version', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- Tech Startup QR versions
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440012', 'https://techstartup.com/product', 'Initial version', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', 'https://techstartup.com/product-v2', 'Updated with new features', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440012', 'https://techstartup.com/product', 'Reverted to stable version', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440013', 'https://techstartup.com/support', 'Initial support page', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440014', 'https://techstartup.com/old', 'Initial marketing archive', '550e8400-e29b-41d4-a716-446655440011'),
  
  -- Restaurant QR versions
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440022', 'https://restaurant.com/menu', 'Initial menu QR', '550e8400-e29b-41d4-a716-446655440021'),
  ('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440022', 'https://restaurant.com/menu-summer', 'Updated for summer menu', '550e8400-e29b-41d4-a716-446655440021'),
  ('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440023', 'https://restaurant.com/reserve', 'Initial reservation QR', '550e8400-e29b-41d4-a716-446655440021'),
  
  -- Event QR versions
  ('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440032', 'https://events.com/register', 'Initial registration page', '550e8400-e29b-41d4-a716-446655440031'),
  ('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440032', 'https://events.com/register-early', 'Early bird registration', '550e8400-e29b-41d4-a716-446655440031'),
  ('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440033', 'https://events.com/schedule', 'Initial event schedule', '550e8400-e29b-41d4-a716-446655440031'),
  ('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440034', 'https://events.com/speakers', 'Initial speaker bios', '550e8400-e29b-41d4-a716-446655440031'),
  
  -- Archived business QR versions
  ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440042', 'https://archived.com', 'Original archived site', '550e8400-e29b-41d4-a716-446655440041');

-- ===== Sample Scan Events (for analytics demo)
INSERT INTO public.scan_events (qr_id, ip_hash, user_agent, referrer, country, city) VALUES 
  -- Demo QR scans
  ('550e8400-e29b-41d4-a716-446655440002', 'abc123hash', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', 'https://google.com', 'US', 'New York'),
  ('550e8400-e29b-41d4-a716-446655440002', 'def456hash', 'Mozilla/5.0 (Android; Mobile; rv:68.0)', 'https://facebook.com', 'CA', 'Toronto'),
  ('550e8400-e29b-41d4-a716-446655440002', 'ghi789hash', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, 'US', 'San Francisco'),
  
  -- Tech Startup QR scans
  ('550e8400-e29b-41d4-a716-446655440012', 'jkl012hash', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'https://linkedin.com', 'US', 'San Francisco'),
  ('550e8400-e29b-41d4-a716-446655440012', 'mno345hash', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://twitter.com', 'US', 'New York'),
  ('550e8400-e29b-41d4-a716-446655440012', 'pqr678hash', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://producthunt.com', 'UK', 'London'),
  ('550e8400-e29b-41d4-a716-446655440012', 'stu901hash', 'Mozilla/5.0 (Linux; Android 11)', 'https://reddit.com', 'DE', 'Berlin'),
  
  -- Restaurant QR scans
  ('550e8400-e29b-41d4-a716-446655440022', 'vwx234hash', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', NULL, 'US', 'Los Angeles'),
  ('550e8400-e29b-41d4-a716-446655440022', 'yza567hash', 'Mozilla/5.0 (Android; Mobile)', 'https://yelp.com', 'US', 'Los Angeles'),
  ('550e8400-e29b-41d4-a716-446655440022', 'bcd890hash', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'https://google.com', 'US', 'Los Angeles'),
  
  -- Event QR scans
  ('550e8400-e29b-41d4-a716-446655440032', 'efg123hash', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://eventbrite.com', 'US', 'Austin'),
  ('550e8400-e29b-41d4-a716-446655440032', 'hij456hash', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://linkedin.com', 'CA', 'Vancouver'),
  ('550e8400-e29b-41d4-a716-446655440032', 'klm789hash', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', 'https://twitter.com', 'US', 'Seattle');

-- ===== Sample Daily Aggregates (for dashboard performance)
INSERT INTO public.daily_aggregates (qr_id, day, scans, uniques) VALUES 
  -- Demo QR aggregates
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '7 days', 12, 8),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '6 days', 8, 6),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '5 days', 15, 11),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '4 days', 6, 4),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '3 days', 9, 7),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', 5, 3),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 8, 6),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 3, 2),
  
  -- Tech Startup QR aggregates
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '7 days', 45, 32),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '6 days', 52, 38),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '5 days', 38, 27),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '4 days', 61, 44),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '3 days', 47, 33),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '2 days', 55, 41),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE - INTERVAL '1 day', 42, 31),
  ('550e8400-e29b-41d4-a716-446655440012', CURRENT_DATE, 18, 14),
  
  -- Restaurant QR aggregates
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '7 days', 23, 18),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '6 days', 19, 15),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '5 days', 25, 20),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '4 days', 21, 17),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '3 days', 28, 22),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '2 days', 24, 19),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE - INTERVAL '1 day', 31, 25),
  ('550e8400-e29b-41d4-a716-446655440022', CURRENT_DATE, 26, 21),
  
  -- Event QR aggregates
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '7 days', 67, 45),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '6 days', 73, 52),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '5 days', 89, 61),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '4 days', 95, 68),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '3 days', 78, 54),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '2 days', 82, 59),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE - INTERVAL '1 day', 91, 65),
  ('550e8400-e29b-41d4-a716-446655440032', CURRENT_DATE, 45, 32);

