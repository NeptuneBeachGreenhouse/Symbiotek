import { supabase } from './supabase-client';

export interface PlantReading {
  sensor_type: 'soil_moisture' | 'temperature' | 'humidity' | 'light';
  value: number;
  timestamp: string;
}

export interface Plant {
  id: string;
  name: string;
  plant_type_id: number;
  latest_readings?: PlantReading[];
}

export async function getUserPlants(): Promise<Plant[]> {
  const { data: plants, error } = await supabase
    .from('user_plants')
    .select(`
      *,
      latest_readings (
        sensor_type,
        value,
        timestamp
      )
    `);

  if (error) {
    console.error('Error fetching plants:', error);
    return [];
  }

  return plants || [];
}

export async function createPlant(name: string, plantTypeId: number): Promise<Plant | null> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Not authenticated');
    }

    // First verify the plant type exists
    const { data: plantType, error: plantTypeError } = await supabase
      .from('plant_types')
      .select('id, name')
      .eq('id', plantTypeId)
      .single();

    if (plantTypeError) {
      console.error('Error verifying plant type:', plantTypeError);
      throw new Error(`Plant type error: ${plantTypeError.message}`);
    }

    if (!plantType) {
      throw new Error(`Plant type not found: ${plantTypeId}`);
    }

    console.log('Creating plant:', { name, plantTypeId, userId: user.id });

    // Create the plant with current timestamp
    const created_at = new Date().toISOString();
    const { data: plant, error: insertError } = await supabase
      .from('user_plants')
      .insert([{ 
        name, 
        plant_type_id: plantTypeId,
        user_id: user.id,
        created_at
      }])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting plant:', insertError);
      throw new Error(`Plant creation error: ${insertError.message}`);
    }

    if (!plant) {
      throw new Error('No plant returned after insert');
    }

    console.log('Plant created:', plant);

    // Define the sensor type enum
    type SensorType = 'soil_moisture' | 'temperature' | 'humidity' | 'light';
    
    // Create initial readings one at a time for better error tracking
    const readingTypes: Array<{type: SensorType, value: number}> = [
      { type: 'soil_moisture', value: 65 + (Math.random() * 20 - 10) },
      { type: 'temperature', value: 70 + (Math.random() * 10 - 5) },
      { type: 'humidity', value: 55 + (Math.random() * 30 - 15) },
      { type: 'light', value: 750 + (Math.random() * 500 - 250) }
    ];

    for (const reading of readingTypes) {
      const { error: readingError } = await supabase
        .from('sensor_readings')
        .insert([{
          plant_id: plant.id,
          sensor_type: reading.type,
          value: reading.value
        }]);

      if (readingError) {
        console.error(`Error inserting ${reading.type} reading:`, readingError);
        throw new Error(`Sensor reading error (${reading.type}): ${readingError.message}`);
      }
    }

    console.log('All readings created successfully');
    return plant;

  } catch (err) {
    if (err instanceof Error) {
      console.error('Error creating plant:', err.message);
    } else {
      console.error('Unexpected error creating plant:', err);
    }
    throw err; // Re-throw to handle in the component
  }
}

export async function refreshPlantData(plantId: string): Promise<void> {
  const { error } = await supabase.rpc('generate_mock_readings', { p_plant_id: plantId });
  if (error) {
    console.error('Error refreshing plant data:', error);
  }
}

// Subscribe to real-time updates for a plant's sensor readings
export function subscribeToPlantReadings(
  plantId: string, 
  onUpdate: (readings: PlantReading[]) => void
): (() => void) {
  const subscription = supabase
    .channel(`plant-${plantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `plant_id=eq.${plantId}`
      },
      async (payload) => {
        // Fetch latest readings when new data arrives
        const { data } = await supabase
          .from('latest_readings')
          .select('*')
          .eq('plant_id', plantId);
        
        if (data) {
          onUpdate(data);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}
