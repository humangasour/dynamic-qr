-- ===== Migration: Add Missing Foreign Key Indexes
-- This migration adds indexes on foreign key columns to improve query performance
-- Foreign key constraints without covering indexes can cause performance issues

-- ===== Add missing indexes on foreign key columns

-- Index for daily_aggregates.qr_id foreign key
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_qr_id 
ON public.daily_aggregates(qr_id);

-- Index for org_members.org_id foreign key  
CREATE INDEX IF NOT EXISTS idx_org_members_org_id 
ON public.org_members(org_id);

-- Index for qr_codes.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_by 
ON public.qr_codes(created_by);

-- Index for qr_versions.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_qr_versions_created_by 
ON public.qr_versions(created_by);

-- Index for qr_versions.qr_id foreign key
CREATE INDEX IF NOT EXISTS idx_qr_versions_qr_id 
ON public.qr_versions(qr_id);

-- Index for scan_events.qr_id foreign key
CREATE INDEX IF NOT EXISTS idx_scan_events_qr_id 
ON public.scan_events(qr_id);

-- ===== Comments for documentation
COMMENT ON INDEX idx_daily_aggregates_qr_id IS 'Index on foreign key to qr_codes for daily aggregates queries';
COMMENT ON INDEX idx_org_members_org_id IS 'Index on foreign key to orgs for organization member queries';
COMMENT ON INDEX idx_qr_codes_created_by IS 'Index on foreign key to users for QR code creator queries';
COMMENT ON INDEX idx_qr_versions_created_by IS 'Index on foreign key to users for QR version creator queries';
COMMENT ON INDEX idx_qr_versions_qr_id IS 'Index on foreign key to qr_codes for QR version queries';
COMMENT ON INDEX idx_scan_events_qr_id IS 'Index on foreign key to qr_codes for scan event queries';
