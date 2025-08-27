-- Test query to check if tables exist and have data
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM (
    VALUES 
        ('plant_types'),
        ('sensor_thresholds'),
        ('user_plants'),
        ('sensor_readings')
) as t(table_name)
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = t.table_name
);
