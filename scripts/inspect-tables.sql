-- Check plant_types table
SELECT * FROM plant_types ORDER BY id LIMIT 5;

-- Check plant_requirements table
SELECT * FROM plant_requirements ORDER BY id LIMIT 5;

-- Check sensor_thresholds table
SELECT * FROM sensor_thresholds ORDER BY id LIMIT 5;

-- Check latest_readings view
SELECT * FROM latest_readings LIMIT 5;

-- Check sensor_readings table
SELECT * FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 5;

-- Check user_plants table
SELECT 
    up.*,
    pt.name as plant_type_name
FROM user_plants up
LEFT JOIN plant_types pt ON up.plant_type_id = pt.id
ORDER BY up.created_at DESC
LIMIT 5;

-- Check table structures
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c 
    ON t.table_name = c.table_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
        'plant_types',
        'plant_requirements',
        'sensor_thresholds',
        'sensor_readings',
        'user_plants'
    )
ORDER BY 
    t.table_name,
    c.ordinal_position;
