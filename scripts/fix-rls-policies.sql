-- First, enable RLS on both tables
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own plants" ON public.user_plants;
DROP POLICY IF EXISTS "Users can insert their own plants" ON public.user_plants;
DROP POLICY IF EXISTS "Users can view their plants sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Users can insert sensor readings for their plants" ON public.sensor_readings;

-- Create policies for user_plants
CREATE POLICY "Users can view their own plants"
    ON public.user_plants
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
    ON public.user_plants
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create more permissive policies for sensor_readings
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

-- Make the insert policy more permissive by allowing inserts during plant creation
CREATE POLICY "Users can insert sensor readings for their plants"
    ON public.sensor_readings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_plants up
            WHERE up.id = sensor_readings.plant_id
            AND (
                -- Either the user owns the plant
                up.user_id = auth.uid()
                OR
                -- Or this is a new plant being created (within last minute)
                (up.created_at >= NOW() - INTERVAL '1 minute' 
                 AND up.user_id = auth.uid())
            )
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.user_plants TO authenticated;
GRANT ALL ON public.sensor_readings TO authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_plants', 'sensor_readings');
