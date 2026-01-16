import axios from 'axios';
import type {
  Workout,
  WorkoutDetail,
  Exercise,
  SleepLog,
  SleepStats,
  WeightLog,
  WeightStats,
  VolumeDataPoint,
  ExerciseProgressDataPoint,
  AuthResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitness_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', { password });
    return response.data;
  },
};

// Workouts API
export const workoutsAPI = {
  getWorkouts: async (params?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ workouts: Workout[]; total: number; limit: number; offset: number }> => {
    const response = await api.get('/api/workouts', { params });
    return response.data;
  },

  getWorkoutById: async (id: number): Promise<WorkoutDetail> => {
    const response = await api.get<WorkoutDetail>(`/api/workouts/${id}`);
    return response.data;
  },

  getVolumeOverTime: async (params?: {
    days?: number;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{ data: VolumeDataPoint[] }> => {
    const response = await api.get('/api/workouts/stats/volume-over-time', { params });
    return response.data;
  },
};

// Exercises API
export const exercisesAPI = {
  getExercises: async (): Promise<{ exercises: Exercise[] }> => {
    const response = await api.get('/api/exercises');
    return response.data;
  },

  getExerciseHistory: async (id: number, limit?: number): Promise<any> => {
    const response = await api.get(`/api/exercises/${id}/history`, {
      params: { limit },
    });
    return response.data;
  },

  getExerciseProgress: async (
    id: number,
    params?: {
      metric?: 'max_weight' | 'total_volume' | 'max_reps';
      days?: number;
    }
  ): Promise<{
    exercise_id: number;
    exercise_name: string;
    metric: string;
    data: ExerciseProgressDataPoint[];
  }> => {
    const response = await api.get(`/api/exercises/${id}/progress`, { params });
    return response.data;
  },
};

// Sleep API
export const sleepAPI = {
  getSleepLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ logs: SleepLog[]; stats: SleepStats }> => {
    const response = await api.get('/api/sleep', { params });
    return response.data;
  },
};

// Weight API
export const weightAPI = {
  getWeightLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ logs: WeightLog[]; stats: WeightStats }> => {
    const response = await api.get('/api/weight', { params });
    return response.data;
  },
};

export default api;
