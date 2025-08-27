import { supabase } from './supabase-client';

export interface SensorThreshold {
  level: 'critical_low' | 'warning_low' | 'ideal' | 'warning_high' | 'critical_high';
  min_value: number;
  max_value: number;
  label: string;
  color: string;
}

export async function getSensorThresholds(
  sensorType: 'soil_moisture' | 'light' | 'temperature' | 'humidity',
  plantTypeId?: number
): Promise<SensorThreshold[]> {
  // First try to get plant-specific thresholds
  if (plantTypeId) {
    const { data: specificThresholds, error: specificError } = await supabase
      .from('sensor_thresholds')
      .select('*')
      .eq('sensor_type', sensorType)
      .eq('plant_type_id', plantTypeId)
      .order('min_value', { ascending: true });

    if (!specificError && specificThresholds.length > 0) {
      return specificThresholds;
    }
  }

  // Fall back to default thresholds (where plant_type_id is null)
  const { data: defaultThresholds, error: defaultError } = await supabase
    .from('sensor_thresholds')
    .select('*')
    .eq('sensor_type', sensorType)
    .is('plant_type_id', null)
    .order('min_value', { ascending: true });

  if (defaultError) {
    console.error('Error fetching sensor thresholds:', defaultError);
    return [];
  }

  return defaultThresholds || [];
}

export function getCurrentThreshold(value: number, thresholds: SensorThreshold[]): SensorThreshold | null {
  return thresholds.find(t => value >= t.min_value && value <= t.max_value) || null;
}
