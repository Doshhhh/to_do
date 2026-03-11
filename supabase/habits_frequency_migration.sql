-- =============================================
-- Flexible habit frequency migration
-- =============================================

-- 1. Add frequency_days column (array of integers for specific day-of-week)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency_days INTEGER[];

-- 2. Drop old CHECK constraint and add new one with all frequency types
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_type_check;
ALTER TABLE habits ADD CONSTRAINT habits_frequency_type_check
  CHECK (frequency_type IN ('daily', 'weekly', 'specific_days', 'times_per_week', 'times_per_month', 'every_n_days'));

-- 3. Migrate existing 'weekly' habits to 'times_per_week'
UPDATE habits SET frequency_type = 'times_per_week' WHERE frequency_type = 'weekly';
