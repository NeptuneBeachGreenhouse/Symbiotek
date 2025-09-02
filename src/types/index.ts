export enum PlantType {
  TROPICAL = 'TROPICAL',
  SUCCULENT = 'SUCCULENT',
  HERB = 'HERB',
  VINE = 'VINE',
  FERN = 'FERN'
}

export enum Personality {
  PLAYFUL = 'PLAYFUL',
  WISE = 'WISE',
  SASSY = 'SASSY',
  NURTURING = 'NURTURING',
  SCIENTIFIC = 'SCIENTIFIC'
}

export interface HistoryEntry {
  timestamp: number;
  moisture: number;
  light: number;
  status: string;
}

export interface Plant {
  id: string;
  name: string;
  plantType: PlantType;
  personality: Personality;
  moisture: number;
  light: number;
  status: string;
  history: HistoryEntry[];
}

export interface CareThreshold {
  low: number;
  high: number;
}

export interface PlantThresholds {
  moisture: CareThreshold;
  light: CareThreshold;
}
