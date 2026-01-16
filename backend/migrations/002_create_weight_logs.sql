-- Weight tracking table (skip if exists)
CREATE TABLE IF NOT EXISTS weight_logs (
    id SERIAL PRIMARY KEY,
    log_date DATE NOT NULL UNIQUE,
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    body_fat_pct DECIMAL(4,2) CHECK (body_fat_pct >= 0 AND body_fat_pct <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'weight_logs' AND column_name = 'updated_at') THEN
        ALTER TABLE weight_logs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(log_date DESC);

-- Drop and recreate trigger (to ensure it exists)
DROP TRIGGER IF EXISTS update_weight_logs_updated_at ON weight_logs;
CREATE TRIGGER update_weight_logs_updated_at BEFORE UPDATE ON weight_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
