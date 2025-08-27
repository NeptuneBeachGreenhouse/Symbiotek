-- Drop the sensor_readings table and recreate it properly
DROP TABLE IF EXISTS public.sensor_readings;

-- Recreate the enum to ensure it's correct
DROP TYPE IF EXISTS sensor_type;
CREATE TYPE sensor_type AS ENUM ('soil_moisture', 'temperature', 'humidity', 'light');

-- Recreate the sensor_readings table
CREATE TABLE public.sensor_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
    sensor_type sensor_type NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their plants sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Users can insert sensor readings for their plants" ON public.sensor_readings;

-- Create policies
CREATE POLICY "Users can view their plants sensor readings"
    ON public.sensor_readings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_plants
            WHERE id = sensor_readings.plant_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sensor readings for their plants"
    ON public.sensor_readings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_plants
            WHERE id = sensor_readings.plant_id
            AND user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.sensor_readings TO authenticated;
GRANT USAGE ON TYPE sensor_type TO authenticated;
