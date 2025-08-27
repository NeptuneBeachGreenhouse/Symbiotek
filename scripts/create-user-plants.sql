-- Create table for user's plants
CREATE TABLE IF NOT EXISTS public.user_plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  plant_type_id INTEGER REFERENCES public.plant_types(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create table for sensor readings
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE CASCADE,
  sensor_type sensor_type NOT NULL,
  value FLOAT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create view for latest sensor readings
CREATE OR REPLACE VIEW public.latest_readings AS
SELECT DISTINCT ON (plant_id, sensor_type)
  sr.plant_id,
  sr.sensor_type,
  sr.value,
  sr.timestamp
FROM public.sensor_readings sr
ORDER BY plant_id, sensor_type, timestamp DESC;

-- Enable RLS
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own plants"
  ON public.user_plants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON public.user_plants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their plants' sensor readings"
  ON public.sensor_readings
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = sensor_readings.plant_id
    AND user_id = auth.uid()
  ));

-- Function to simulate sensor readings
CREATE OR REPLACE FUNCTION simulate_sensor_reading(
  p_plant_id UUID,
  p_sensor_type sensor_type,
  p_base_value FLOAT,
  p_variance FLOAT
) RETURNS FLOAT AS $$
DECLARE
  random_factor FLOAT;
BEGIN
  -- Generate random variance between -p_variance and +p_variance
  random_factor := (random() * 2 - 1) * p_variance;
  RETURN p_base_value + random_factor;
END;
$$ LANGUAGE plpgsql;

-- Function to generate mock readings for a plant
CREATE OR REPLACE FUNCTION generate_mock_readings(
  p_plant_id UUID
) RETURNS void AS $$
BEGIN
  -- Insert moisture reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'soil_moisture', simulate_sensor_reading(p_plant_id, 'soil_moisture', 70, 10));
  
  -- Insert temperature reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'temperature', simulate_sensor_reading(p_plant_id, 'temperature', 72, 5));
  
  -- Insert humidity reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'humidity', simulate_sensor_reading(p_plant_id, 'humidity', 55, 15));
  
  -- Insert light reading
  INSERT INTO public.sensor_readings (plant_id, sensor_type, value)
  VALUES (p_plant_id, 'light', simulate_sensor_reading(p_plant_id, 'light', 750, 250));
END;
$$ LANGUAGE plpgsql;
