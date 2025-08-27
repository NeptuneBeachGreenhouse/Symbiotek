-- Check if tables exist and their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('plant_types', 'user_plants', 'sensor_readings')
ORDER BY table_name, ordinal_position;

-- Check if plant_types has data
SELECT * FROM plant_types;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
