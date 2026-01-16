export interface Workout {
  id: number;
  name: string;
  workout_date: string;
  source?: string;
  exercise_count: number;
  total_sets: number;
  total_volume: number;
}

export interface WorkoutDetail {
  id: number;
  name: string;
  workout_date: string;
  source?: string;
  exercises: ExerciseWithSets[];
  total_volume: number;
  total_sets: number;
}

export interface ExerciseWithSets {
  exercise_id: number;
  exercise_name: string;
  sets: SetDetail[];
  total_volume: number;
}

export interface SetDetail {
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface Exercise {
  id: number;
  name: string;
  total_sets: number;
  last_performed?: string;
  max_weight: number;
}

export interface SleepLog {
  id: number;
  log_date: string;
  duration_hours?: number;
  quality?: number;
  notes?: string;
}

export interface SleepStats {
  avg_duration?: number;
  avg_quality?: number;
  total_logs: number;
}

export interface WeightLog {
  id: number;
  log_date: string;
  weight_kg: number;
  body_fat_pct?: number;
  notes?: string;
}

export interface WeightStats {
  current_weight?: number;
  start_weight?: number;
  weight_change?: number;
  avg_body_fat?: number;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
}

export interface ExerciseProgressDataPoint {
  date: string;
  value: number;
}

export interface AuthResponse {
  token: string;
  expires_in: number;
}
