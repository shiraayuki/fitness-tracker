import { query } from '../config/database';
import {
  ExerciseSummary,
  ExerciseHistory,
  ExerciseProgressDataPoint,
} from '../types';

export const getExercises = async (): Promise<ExerciseSummary[]> => {
  const exercisesQuery = `
    SELECT
      e.id,
      e.name,
      COUNT(s.id) as total_sets,
      MAX(w.workout_date) as last_performed,
      MAX(s.weight_kg) as max_weight
    FROM exercises e
    LEFT JOIN sets s ON s.exercise_id = e.id
    LEFT JOIN workouts w ON w.id = s.workout_id
    GROUP BY e.id, e.name
    ORDER BY last_performed DESC NULLS LAST, e.name ASC
  `;

  const result = await query<ExerciseSummary>(exercisesQuery);
  return result;
};

export const getExerciseHistory = async (
  exerciseId: number,
  limit: number = 50
): Promise<{ exercise_id: number; exercise_name: string; history: ExerciseHistory[] }> => {
  const exerciseNameQuery = `
    SELECT name FROM exercises WHERE id = $1
  `;

  const exerciseNameResult = await query<{ name: string }>(exerciseNameQuery, [exerciseId]);

  if (exerciseNameResult.length === 0) {
    throw new Error('Exercise not found');
  }

  const historyQuery = `
    SELECT
      w.id as workout_id,
      w.name as workout_name,
      w.workout_date as date,
      s.weight_kg,
      s.reps,
      ROW_NUMBER() OVER (PARTITION BY w.id ORDER BY s.id) as set_number
    FROM sets s
    JOIN workouts w ON w.id = s.workout_id
    WHERE s.exercise_id = $1
    ORDER BY w.workout_date DESC, s.id
    LIMIT $2
  `;

  const historyData = await query<{
    workout_id: number;
    workout_name: string;
    date: Date;
    weight_kg: number;
    reps: number;
    set_number: number;
  }>(historyQuery, [exerciseId, limit * 10]);

  const workoutsMap = new Map<number, ExerciseHistory>();

  historyData.forEach((row) => {
    if (!workoutsMap.has(row.workout_id)) {
      workoutsMap.set(row.workout_id, {
        workout_id: row.workout_id,
        workout_name: row.workout_name,
        date: row.date,
        sets: [],
        max_weight: 0,
        total_volume: 0,
      });
    }

    const workout = workoutsMap.get(row.workout_id)!;
    const volume = row.weight_kg * row.reps;

    workout.sets.push({
      set_number: row.set_number,
      weight_kg: row.weight_kg,
      reps: row.reps,
    });

    workout.max_weight = Math.max(workout.max_weight, row.weight_kg);
    workout.total_volume += volume;
  });

  const history = Array.from(workoutsMap.values()).slice(0, limit);

  return {
    exercise_id: exerciseId,
    exercise_name: exerciseNameResult[0].name,
    history,
  };
};

export const getExerciseProgress = async (
  exerciseId: number,
  metric: 'max_weight' | 'total_volume' | 'max_reps' = 'max_weight',
  days: number = 90
): Promise<{ exercise_id: number; exercise_name: string; metric: string; data: ExerciseProgressDataPoint[] }> => {
  const exerciseNameQuery = `
    SELECT name FROM exercises WHERE id = $1
  `;

  const exerciseNameResult = await query<{ name: string }>(exerciseNameQuery, [exerciseId]);

  if (exerciseNameResult.length === 0) {
    throw new Error('Exercise not found');
  }

  let selectMetric = '';
  switch (metric) {
    case 'max_weight':
      selectMetric = 'MAX(s.weight_kg)';
      break;
    case 'total_volume':
      selectMetric = 'SUM(s.weight_kg * s.reps)';
      break;
    case 'max_reps':
      selectMetric = 'MAX(s.reps)';
      break;
  }

  const progressQuery = `
    SELECT
      w.workout_date::date as date,
      ${selectMetric} as value
    FROM sets s
    JOIN workouts w ON w.id = s.workout_id
    WHERE s.exercise_id = $1
      AND w.workout_date >= NOW() - INTERVAL '${days} days'
    GROUP BY w.workout_date::date
    ORDER BY date ASC
  `;

  const result = await query<{ date: string; value: string }>(progressQuery, [exerciseId]);

  return {
    exercise_id: exerciseId,
    exercise_name: exerciseNameResult[0].name,
    metric,
    data: result.map((row) => ({
      date: row.date,
      value: parseFloat(row.value),
    })),
  };
};
