-- Sleep tracking table (skip if exists)
CREATE TABLE IF NOT EXISTS sleep_logs (
    id SERIAL PRIMARY KEY,
    log_date DATE NOT NULL UNIQUE,
    duration_hours DECIMAL(4,1) CHECK (duration_hours >= 0 AND duration_hours <= 24),
    quality INTEGER CHECK (quality BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'sleep_logs' AND column_name = 'updated_at') THEN
        ALTER TABLE sleep_logs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date ON sleep_logs(log_date DESC);

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger (to ensure it exists)
DROP TRIGGER IF EXISTS update_sleep_logs_updated_at ON sleep_logs;
CREATE TRIGGER update_sleep_logs_updated_at BEFORE UPDATE ON sleep_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
