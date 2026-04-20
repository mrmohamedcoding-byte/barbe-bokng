-- ============================================
-- BOOKFLOW - DATABASE SCHEMA UPGRADE
-- ============================================
-- Run this SQL in Supabase SQL Editor to add payment fields
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- ============================================
-- ADD PAYMENT COLUMNS TO APPOINTMENTS
-- ============================================

-- Add new columns for payment tracking
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
ADD COLUMN IF NOT EXISTS amount_paid BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- ============================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent ON appointments(reminder_sent);

-- ============================================
-- ENABLE REALTIME FOR APPOINTMENTS
-- ============================================

-- This should already be enabled, but just in case:
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Enable read access for authenticated users"
ON appointments
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Enable insert for service role"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for service role"
ON appointments
FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Run this to verify columns were added:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments';
