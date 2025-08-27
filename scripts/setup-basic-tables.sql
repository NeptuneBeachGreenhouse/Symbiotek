-- Create enum for sensor types
CREATE TYPE sensor_type AS ENUM ('soil_moisture', 'temperature', 'humidity', 'light');

-- Create table for plant types if it doesn't exist
CREATE TABLE IF NOT EXISTS public.plant_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Create table for user's plants
CREATE TABLE IF NOT EXISTS public.user_plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  plant_type_id INTEGER REFERENCES plant_types(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create table for sensor readings
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  sensor_type sensor_type NOT NULL,
  value FLOAT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default plant types if they don't exist
INSERT INTO public.plant_types (name, description)
VALUES 
  ('Monstera', 'Swiss Cheese Plant - tropical plant with iconic split leaves'),
  ('Cactus', 'Desert plant that thrives in dry conditions'),
  ('Snake Plant', 'Hardy succulent that tolerates low light')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own plants"
  ON public.user_plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON public.user_plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their plants sensor readings"
  ON public.sensor_readings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = sensor_readings.plant_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sensor readings for their plants"
  ON public.sensor_readings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = sensor_readings.plant_id
    AND user_id = auth.uid()
  ));
