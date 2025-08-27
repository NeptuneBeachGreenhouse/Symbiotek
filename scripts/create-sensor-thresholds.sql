-- Create enum for threshold levels if it doesn't exist
CREATE TYPE threshold_level AS ENUM ('critical_low', 'warning_low', 'ideal', 'warning_high', 'critical_high');

-- Create table for sensor thresholds
CREATE TABLE IF NOT EXISTS public.sensor_thresholds (
    id SERIAL PRIMARY KEY,
    plant_type_id INTEGER REFERENCES plant_types(id),
    sensor_type sensor_type NOT NULL,
    level threshold_level NOT NULL,
    min_value FLOAT NOT NULL,
    max_value FLOAT NOT NULL,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policy
ALTER TABLE public.sensor_thresholds ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read thresholds
CREATE POLICY "Allow authenticated users to read thresholds"
    ON public.sensor_thresholds
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert default thresholds for general plant types
INSERT INTO public.sensor_thresholds 
    (plant_type_id, sensor_type, level, min_value, max_value, label, color)
VALUES 
    -- Default light thresholds (null plant_type_id means applies to all plants)
    (NULL, 'light', 'critical_low', 0, 25, 'Dark', 'gray'),
    (NULL, 'light', 'warning_low', 26, 50, 'Low Light', 'blue'),
    (NULL, 'light', 'ideal', 51, 75, 'Ideal Light', 'green'),
    (NULL, 'light', 'warning_high', 76, 90, 'Bright', 'yellow'),
    (NULL, 'light', 'critical_high', 91, 100, 'Too Bright', 'red'),

    -- Default moisture thresholds
    (NULL, 'soil_moisture', 'critical_low', 0, 25, 'Very Dry', 'red'),
    (NULL, 'soil_moisture', 'warning_low', 26, 50, 'Dry', 'yellow'),
    (NULL, 'soil_moisture', 'ideal', 51, 75, 'Ideal Moisture', 'green'),
    (NULL, 'soil_moisture', 'warning_high', 76, 90, 'Moist', 'blue'),
    (NULL, 'soil_moisture', 'critical_high', 91, 100, 'Too Wet', 'purple'),

    -- Specific thresholds for Cactus (assuming plant_type_id = 2)
    (2, 'soil_moisture', 'critical_low', 0, 10, 'Very Dry', 'red'),
    (2, 'soil_moisture', 'warning_low', 11, 20, 'Dry', 'yellow'),
    (2, 'soil_moisture', 'ideal', 21, 35, 'Perfect for Cactus', 'green'),
    (2, 'soil_moisture', 'warning_high', 36, 50, 'Too Moist', 'blue'),
    (2, 'soil_moisture', 'critical_high', 51, 100, 'Danger - Too Wet', 'purple')
ON CONFLICT DO NOTHING;
