import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fecrrjasjlredxxoroie.supabase.co';
const supabaseKey = 'sb_publishable_WPshZ5wnU7ixiJjWoFaZ9A_0Vpi_SmW';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to verify connection
async function testConnection() {
  try {
    // Query plant types
    const { data, error } = await supabase
      .from('plant_types')
      .select(`
        *,
        sensor_thresholds (*)
      `);
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('Connection successful! Found plant types:', 
      JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Test failed:', err);
    return false;
  }
}

export { testConnection, supabase };
