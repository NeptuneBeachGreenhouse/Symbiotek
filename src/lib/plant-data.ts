import { supabase } from './supabase-client';
import { Plant, PlantType, Personality } from '@/types';

export async function getUserPlants(): Promise<Plant[]> {
  // First, always get the test plant (available to everyone)
  const { data: testPlants } = await supabase
    .from('user_plants')
    .select('*')
    .eq('name', 'Test Monstera');

  let allPlants: unknown[] = testPlants || [];

  // If user is authenticated, also get their personal plants
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userPlants, error: userError } = await supabase
      .from('user_plants')
      .select('*')
      .eq('user_id', user.id);

    if (!userError && userPlants) {
      // Combine test plants and user plants, avoiding duplicates
      const userPlantIds = new Set(userPlants.map(p => p.id));
      const uniqueTestPlants = allPlants.filter(p => !userPlantIds.has(p.id));
      allPlants = [...uniqueTestPlants, ...userPlants];
    }
  }

  // Get sensor readings for all plants
  const plantsWithReadings =         await Promise.all(
          allPlants.map(async (plant: Record<string, unknown>) => {
      const { data: readings } = await supabase
        .from('sensor_readings')
        .select('sensor_type, value, timestamp')
        .eq('plant_id', plant.id)
        .order('timestamp', { ascending: false })
        .limit(2); // Get latest moisture and light readings

      return {
        ...plant,
        latest_readings: readings || []
      };
    })
  );

  // Transform the data to match our Plant interface
  return plantsWithReadings.map(dbPlant => ({
    id: dbPlant.id,
    name: dbPlant.name,
    plantType: dbPlant.plant_type as PlantType,
    personality: dbPlant.personality as Personality || Personality.PLAYFUL,
    moisture: dbPlant.latest_readings?.find((r: { sensor_type: string }) => r.sensor_type === 'soil_moisture')?.value || 50,
    light: dbPlant.latest_readings?.find((r: { sensor_type: string }) => r.sensor_type === 'light')?.value || 12000,
    status: dbPlant.status || "I'm new here! Can't wait to grow with you.",
    history: []  // We'll load this separately when needed
  }));
}

export async function createPlant(
  name: string,
  plantType: PlantType,
  personality: Personality = Personality.PLAYFUL
): Promise<Plant | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For demo mode, allow creating plants without auth (they'll be public demo plants)
    const userId = user?.id || null;

    // Create the plant
    const created_at = new Date().toISOString();
    const { data: plant, error: insertError } = await supabase
      .from('user_plants')
      .insert([{ 
        name,
        plant_type: plantType,
        personality,
        user_id: userId,
        created_at,
        status: "I'm new here! Can't wait to grow with you."
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

    // Create initial readings
    const initialReadings = [
      { type: 'soil_moisture', value: 65 + (Math.random() * 20 - 10) },
      { type: 'light', value: 12000 + (Math.random() * 4000 - 2000) }
    ];

    for (const reading of initialReadings) {
      const { error: readingError } = await supabase
        .from('sensor_readings')
        .insert([{
          plant_id: plant.id,
          sensor_type: reading.type,
          value: reading.value
        }]);

      if (readingError) {
        console.error(`Error inserting ${reading.type} reading:`, readingError);
      }
    }

    // Return the plant in our new format
    return {
      id: plant.id,
      name: plant.name,
      plantType: plant.plant_type as PlantType,
      personality: plant.personality as Personality,
      moisture: initialReadings[0].value,
      light: initialReadings[1].value,
      status: plant.status,
      history: []
    };

  } catch (err) {
    if (err instanceof Error) {
      console.error('Error creating plant:', err.message);
    } else {
      console.error('Unexpected error creating plant:', err);
    }
    throw err;
  }
}

export async function updatePlant(
  plantId: string,
  updates: Partial<Plant>
): Promise<void> {
  // Only include fields that are actually being updated
  const updateData: Record<string, unknown> = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.plantType !== undefined) updateData.plant_type = updates.plantType;
  if (updates.personality !== undefined) updateData.personality = updates.personality;
  if (updates.status !== undefined) updateData.status = updates.status;

  // Only proceed if there are actual updates
  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error } = await supabase
    .from('user_plants')
    .update(updateData)
    .eq('id', plantId);

  if (error) {
    console.error('Error updating plant:', error);
    throw new Error(`Failed to update plant: ${error.message}`);
  }
}

export async function deletePlant(plantId: string): Promise<void> {
  const { error } = await supabase
    .from('user_plants')
    .delete()
    .eq('id', plantId);

  if (error) {
    console.error('Error deleting plant:', error);
    throw new Error(`Failed to delete plant: ${error.message}`);
  }
}

export async function getPlantHistory(plantId: string): Promise<Plant['history']> {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('plant_id', plantId)
    .order('timestamp', { ascending: true }) // Changed to ascending for chronological order
    .limit(200); // Increased limit to get more history

  if (error) {
    console.error('Error fetching plant history:', error);
    return [];
  }

  // Group readings by similar timestamps (within 1 hour) and transform to our history format
  const historyMap = new Map();
  data.forEach(reading => {
    // Round timestamp to nearest hour for grouping
    const roundedTime = Math.floor(new Date(reading.timestamp).getTime() / (1000 * 60 * 60)) * (1000 * 60 * 60);
    
    if (!historyMap.has(roundedTime)) {
      historyMap.set(roundedTime, {
        timestamp: roundedTime,
        moisture: 0,
        light: 0,
        status: ''
      });
    }
    const entry = historyMap.get(roundedTime);
    if (reading.sensor_type === 'soil_moisture') {
      entry.moisture = reading.value;
    } else if (reading.sensor_type === 'light') {
      entry.light = reading.value;
    }
  });

  // Convert to array and sort by timestamp
  return Array.from(historyMap.values())
    .filter(entry => entry.moisture > 0 || entry.light > 0) // Only include entries with data
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Function to add sensor readings for testing/demo purposes
export async function addSensorReading(
  plantId: string,
  sensorType: 'soil_moisture' | 'light',
  value: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sensor_readings')
      .insert([{
        plant_id: plantId,
        sensor_type: sensorType,
        value: value,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error adding sensor reading:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error adding sensor reading:', error);
    return false;
  }
}