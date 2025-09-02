import { PlantType, PlantThresholds } from '../types';

export const CARE_THRESHOLDS: Record<PlantType, PlantThresholds> = {
  [PlantType.TROPICAL]: {
    moisture: { low: 60, high: 80 },
    light: { low: 10000, high: 20000 }
  },
  [PlantType.SUCCULENT]: {
    moisture: { low: 20, high: 40 },
    light: { low: 15000, high: 25000 }
  },
  [PlantType.HERB]: {
    moisture: { low: 50, high: 70 },
    light: { low: 12000, high: 22000 }
  },
  [PlantType.VINE]: {
    moisture: { low: 40, high: 60 },
    light: { low: 8000, high: 18000 }
  },
  [PlantType.FERN]: {
    moisture: { low: 70, high: 90 },
    light: { low: 5000, high: 15000 }
  }
};
