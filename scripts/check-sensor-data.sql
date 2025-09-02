-- Check what plants we have
SELECT id, name, plant_type FROM user_plants ORDER BY created_at DESC;

-- Check what sensor readings we have
SELECT sr.*, up.name as plant_name 
FROM sensor_readings sr 
JOIN user_plants up ON sr.plant_id = up.id 
ORDER BY sr.timestamp DESC 
LIMIT 20;

-- Count sensor readings per plant
SELECT up.name, up.id, COUNT(sr.id) as reading_count
FROM user_plants up
LEFT JOIN sensor_readings sr ON sr.plant_id = up.id
GROUP BY up.id, up.name
ORDER BY reading_count DESC;
