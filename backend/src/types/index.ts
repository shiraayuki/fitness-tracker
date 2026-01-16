export interface Workout {
  id: number;
  name: string;
  workout_date: Date;
  source?: string;
  source_msg_id?: string;
  created_at?: Date;
}

export interface WorkoutSummary extends Workout {
  exercise_count: number;
  total_sets: number;
  total_volume: number;
}

export interface Exercise {
  id: number;
  name: string;
  created_at?: Date;
}

export interface ExerciseSummary extends Exercise {
  total_sets: number;
  last_performed?: Date;
  max_weight: number;
}

export interface Set {
  id: number;
  exercise_id: number;
  workout_id: number;
  weight_kg: number;
  reps: number;
  created_at?: Date;
}

export interface WorkoutDetail extends Workout {
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

export interface SleepLog {
  id: number;
  log_date: string;
  duration_hours?: number;
  quality?: number;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
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
  created_at?: Date;
  updated_at?: Date;
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

export interface ExerciseHistory {
  workout_id: number;
  workout_name: string;
  date: Date;
  sets: SetDetail[];
  max_weight: number;
  total_volume: number;
}

export interface AuthResponse {
  token: string;
  expires_in: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
