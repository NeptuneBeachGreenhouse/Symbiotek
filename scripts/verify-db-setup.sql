-- Check if sensor_type enum exists and its values
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'sensor_type'
ORDER BY e.enumsortorder;

-- Check table structures
SELECT table_name, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('plant_types', 'user_plants', 'sensor_readings');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_plants', 'sensor_readings');

-- Check if we have any plant types
SELECT * FROM plant_types;

-- Check if we have any user plants
SELECT up.*, u.email 
FROM user_plants up
JOIN auth.users u ON up.user_id = u.id;

-- Check if we have any sensor readings
SELECT * FROM sensor_readings
LIMIT 5;
