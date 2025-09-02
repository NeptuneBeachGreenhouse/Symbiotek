-- First, let's see what plants we have
SELECT id, name FROM user_plants WHERE name = 'Test Monstera';

-- Add sample sensor readings for the Test Monstera over the past few days
-- We'll use the plant ID from the first query result

WITH test_plant AS (
  SELECT id FROM user_plants WHERE name = 'Test Monstera' LIMIT 1
),
time_series AS (
  SELECT 
    generate_series(
      NOW() - INTERVAL '3 days',
      NOW(),
      INTERVAL '2 hours'
    ) AS reading_time
)
INSERT INTO sensor_readings (plant_id, sensor_type, value, timestamp)
SELECT 
  tp.id,
  'soil_moisture'::sensor_type,
  -- Create realistic moisture readings that vary over time
  GREATEST(20, LEAST(85, 65 + 15 * SIN(EXTRACT(EPOCH FROM ts.reading_time) / 3600.0) + RANDOM() * 10 - 5)),
  ts.reading_time
FROM test_plant tp
CROSS JOIN time_series ts

UNION ALL

SELECT 
  tp.id,
  'light'::sensor_type,
  -- Create realistic light readings with day/night cycle
  CASE 
    WHEN EXTRACT(HOUR FROM ts.reading_time) BETWEEN 6 AND 18 THEN
      GREATEST(8000, LEAST(22000, 15000 + 5000 * SIN((EXTRACT(HOUR FROM ts.reading_time) - 6) * PI() / 12) + RANDOM() * 2000 - 1000))
    ELSE
      GREATEST(0, LEAST(2000, 500 + RANDOM() * 1000))
  END,
  ts.reading_time
FROM test_plant tp
CROSS JOIN time_series ts;

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_readings,
  COUNT(CASE WHEN sensor_type = 'soil_moisture' THEN 1 END) as moisture_readings,
  COUNT(CASE WHEN sensor_type = 'light' THEN 1 END) as light_readings,
  MIN(timestamp) as earliest_reading,
  MAX(timestamp) as latest_reading
FROM sensor_readings sr
JOIN user_plants up ON sr.plant_id = up.id
WHERE up.name = 'Test Monstera';
