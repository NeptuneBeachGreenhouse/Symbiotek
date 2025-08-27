-- Create enum for sensor types
CREATE TYPE sensor_type AS ENUM ('soil_moisture', 'temperature', 'humidity', 'light');

-- Create enum for plant categories
CREATE TYPE plant_category AS ENUM ('tropical', 'cactus', 'vine', 'herb', 'succulent');

-- Create table for plant types
CREATE TABLE IF NOT EXISTS public.plant_types (
  id SERIAL PRIMARY KEY,
  category plant_category NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create table for sensor thresholds by plant type
CREATE TABLE IF NOT EXISTS public.sensor_thresholds (
  id SERIAL PRIMARY KEY,
  plant_type_id INTEGER REFERENCES public.plant_types(id),
  sensor sensor_type NOT NULL,
  optimal_min FLOAT NOT NULL,
  optimal_max FLOAT NOT NULL,
  warning_min FLOAT NOT NULL,
  warning_max FLOAT NOT NULL,
  critical_min FLOAT NOT NULL,
  critical_max FLOAT NOT NULL,
  personality_low TEXT NOT NULL,
  personality_high TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(plant_type_id, sensor)
);

-- Enable RLS
ALTER TABLE public.plant_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_thresholds ENABLE ROW LEVEL SECURITY;

-- Create policies that allow read access to everyone
CREATE POLICY "Allow read access" ON public.plant_types
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow read access" ON public.sensor_thresholds
  FOR SELECT TO authenticated, anon USING (true);

-- Insert some sample plant types
INSERT INTO public.plant_types (category, name, description) VALUES
  ('tropical', 'Monstera Deliciosa', 'Swiss Cheese Plant - tropical plant with iconic split leaves'),
  ('cactus', 'Barrel Cactus', 'Round desert cactus that thrives in dry conditions'),
  ('succulent', 'Snake Plant', 'Hardy succulent that tolerates low light and irregular watering');

-- Insert default thresholds for a tropical plant (Monstera)
INSERT INTO public.sensor_thresholds 
  (plant_type_id, sensor, optimal_min, optimal_max, warning_min, warning_max, critical_min, critical_max, personality_low, personality_high)
VALUES
  (1, 'soil_moisture', 60, 80, 40, 90, 30, 90, 'Spicy', 'Drowsy'),
  (1, 'temperature', 65, 75, 55, 85, 55, 85, 'Sluggish', 'Stressed'),
  (1, 'humidity', 40, 70, 30, 80, 30, 80, 'Crispy', 'Muggy'),
  (1, 'light', 500, 1000, 200, 2000, 200, 2000, 'Sleepy', 'Energetic');

-- Insert thresholds for a cactus (different optimal ranges)
INSERT INTO public.sensor_thresholds 
  (plant_type_id, sensor, optimal_min, optimal_max, warning_min, warning_max, critical_min, critical_max, personality_low, personality_high)
VALUES
  (2, 'soil_moisture', 20, 40, 10, 50, 5, 60, 'Content', 'Uncomfortable'),
  (2, 'temperature', 70, 80, 60, 90, 50, 95, 'Relaxed', 'Agitated'),
  (2, 'humidity', 20, 50, 10, 60, 5, 70, 'Happy', 'Distressed'),
  (2, 'light', 1000, 2000, 500, 3000, 200, 3500, 'Dim', 'Radiant');

-- Insert thresholds for a snake plant (tolerant ranges)
INSERT INTO public.sensor_thresholds 
  (plant_type_id, sensor, optimal_min, optimal_max, warning_min, warning_max, critical_min, critical_max, personality_low, personality_high)
VALUES
  (3, 'soil_moisture', 30, 50, 20, 60, 10, 70, 'Thirsty', 'Saturated'),
  (3, 'temperature', 60, 80, 50, 90, 45, 95, 'Cool', 'Warm'),
  (3, 'humidity', 30, 60, 20, 70, 15, 80, 'Dry', 'Humid'),
  (3, 'light', 200, 800, 100, 1500, 50, 2000, 'Shaded', 'Bright');
