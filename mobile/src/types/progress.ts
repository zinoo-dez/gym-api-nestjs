export interface ProgressEntry {
  id: string;
  sessionId?: string;
  createdAt: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  cardioEndurance?: string;
}
