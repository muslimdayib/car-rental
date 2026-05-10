-- Run this in Supabase SQL Editor before launching the new Bookings page
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_location TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_location TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'Walk-in';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contract_number TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
