-- Run this in Supabase SQL Editor
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS photo_url        TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS id_type          TEXT,
  ADD COLUMN IF NOT EXISTS id_number        TEXT,
  ADD COLUMN IF NOT EXISTS id_expiry        DATE,
  ADD COLUMN IF NOT EXISTS license_type     TEXT,
  ADD COLUMN IF NOT EXISTS license_expiry   DATE,
  ADD COLUMN IF NOT EXISTS issuing_country  TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bg_check_status  TEXT DEFAULT 'Not Checked',
  ADD COLUMN IF NOT EXISTS prev_accidents   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS accident_notes   TEXT,
  ADD COLUMN IF NOT EXISTS blacklisted      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blacklist_reason TEXT,
  ADD COLUMN IF NOT EXISTS blacklisted_by   TEXT,
  ADD COLUMN IF NOT EXISTS blacklisted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS driver_status    TEXT DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS rating           NUMERIC(3,1) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS staff_notes      TEXT;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'drivers' ORDER BY ordinal_position;
