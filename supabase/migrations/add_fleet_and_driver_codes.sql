-- ============================================================
-- Fleet and Driver Codes Migration
-- Adds fleet_number and car_code to cars
-- Adds driver_code and email to drivers
-- ============================================================

ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS fleet_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS car_code VARCHAR(100);

ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS driver_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Verify the columns were added
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('cars', 'drivers')
AND column_name IN ('fleet_number', 'car_code', 'driver_code', 'email')
ORDER BY table_name, ordinal_position;
