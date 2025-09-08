-- Add SVG and PNG storage path fields to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN svg_path TEXT,
ADD COLUMN png_path TEXT;

-- Add comments for documentation
COMMENT ON COLUMN qr_codes.svg_path IS 'Storage path of the SVG version for this QR code';
COMMENT ON COLUMN qr_codes.png_path IS 'Storage path of the PNG version for this QR code';
