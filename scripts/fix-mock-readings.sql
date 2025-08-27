-- First, check if our sensor_type enum exists
CREATE TYPE IF NOT EXISTS sensor_type AS ENUM ('soil_moisture', 'temperature', 'humidity', 'light');

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS generate_mock_readings;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION generate_mock_readings(
  p_plant_id UUID
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify the plant exists and get its user_id
  SELECT user_id INTO v_user_id
  FROM public.user_plants
  WHERE id = p_plant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plant not found: %', p_plant_id;
  END IF;

  -- Insert soil moisture reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'soil_moisture', 
    65 + (random() * 20 - 10)); -- 55-75% range

  -- Insert temperature reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'temperature',
    70 + (random() * 10 - 5)); -- 65-75°F range

  -- Insert humidity reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'humidity',
    55 + (random() * 30 - 15)); -- 40-70% range

  -- Insert light reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'light',
    750 + (random() * 500 - 250)); -- 500-1000 lux range

EXCEPTION WHEN OTHERS THEN
  -- Log the error details
  RAISE NOTICE 'Error in generate_mock_readings: % %', SQLERRM, SQLSTATE;
  -- Re-raise the error
  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for sensor_readings if not exists
DROP POLICY IF EXISTS "Users can insert their plants' sensor readings" ON public.sensor_readings;
CREATE POLICY "Users can insert their plants' sensor readings"
  ON public.sensor_readings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE id = sensor_readings.plant_id
      AND user_id = auth.uid()
    )
  );

-- Test the function
DO $$
DECLARE
  v_plant_id UUID;
BEGIN
  -- Get the first plant ID (for testing)
  SELECT id INTO v_plant_id FROM public.user_plants LIMIT 1;
  
  IF v_plant_id IS NOT NULL THEN
    PERFORM generate_mock_readings(v_plant_id);
    RAISE NOTICE 'Test successful for plant ID: %', v_plant_id;
  ELSE
    RAISE NOTICE 'No plants found for testing';
  END IF;
END;
$$;
