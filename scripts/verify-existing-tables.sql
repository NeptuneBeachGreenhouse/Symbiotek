-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name IN (
        'plant_requirements',
        'plant_types',
        'sensor_readings',
        'sensor_thresholds',
        'user_plants'
    )
ORDER BY 
    table_name,
    ordinal_position;

-- Check existing data in plant_requirements
SELECT * FROM plant_requirements LIMIT 5;

-- Check existing data in sensor_thresholds
SELECT * FROM sensor_thresholds LIMIT 5;

-- Check if we have any views
SELECT 
    viewname,
    definition 
FROM 
    pg_views 
WHERE 
    schemaname = 'public';
