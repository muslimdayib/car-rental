-- ============================================================
-- Cars Table Migration — Run this in Supabase SQL Editor
-- Adds all columns needed for the full Car Registration form
-- ============================================================

ALTER TABLE cars 
-- Basic Info
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS seats INTEGER,
ADD COLUMN IF NOT EXISTS engine_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS transmission VARCHAR(50),
ADD COLUMN IF NOT EXISTS drive_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,

-- Identification
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS engine_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS gps_tracker_id VARCHAR(100),

-- Registration
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS registration_expiry DATE,
ADD COLUMN IF NOT EXISTS road_tax_expiry DATE,
ADD COLUMN IF NOT EXISTS fitness_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS previous_owners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accident_history BOOLEAN DEFAULT FALSE,

-- Financial
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS price_per_week NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS price_per_month NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS min_rental_age INTEGER DEFAULT 21;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cars'
ORDER BY ordinal_position;
