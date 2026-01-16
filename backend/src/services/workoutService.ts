import { query } from '../config/database';
import {
  WorkoutSummary,
  WorkoutDetail,
  ExerciseWithSets,
  VolumeDataPoint,
} from '../types';

export const getWorkouts = async (
  limit: number = 20,
  offset: number = 0,
  startDate?: string,
  endDate?: string
): Promise<{ workouts: WorkoutSummary[]; total: number }> => {
  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  if (startDate && endDate) {
    whereClause = `WHERE w.workout_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(startDate, endDate);
    paramIndex += 2;
  } else if (startDate) {
    whereClause = `WHERE w.workout_date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  } else if (endDate) {
    whereClause = `WHERE w.workout_date <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const countQuery = `
    SELECT COUNT(DISTINCT w.id) as total
    FROM workouts w
    ${whereClause}
  `;

  const dataQuery = `
    SELECT
      w.id,
      w.name,
      w.workout_date,
      w.source,
      w.source_msg_id,
      COUNT(DISTINCT s.exercise_id) as exercise_count,
      COUNT(s.id) as total_sets,
      COALESCE(SUM(s.weight_kg * s.reps), 0) as total_volume
    FROM workouts w
    LEFT JOIN sets s ON s.workout_id = w.id
    ${whereClause}
    GROUP BY w.id, w.name, w.workout_date, w.source, w.source_msg_id
    ORDER BY w.workout_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const [countResult, workouts] = await Promise.all([
    query<{ total: string }>(countQuery, whereClause ? params.slice(0, -2) : []),
    query<WorkoutSummary>(dataQuery, params),
  ]);

  return {
    workouts,
    total: parseInt(countResult[0]?.total || '0'),
  };
};

export const getWorkoutById = async (id: number): Promise<WorkoutDetail | null> => {
  const workoutQuery = `
    SELECT
      w.id,
      w.name,
      w.workout_date,
      w.source,
      w.source_msg_id
    FROM workouts w
    WHERE w.id = $1
  `;

  const workoutResult = await query<WorkoutDetail>(workoutQuery, [id]);
  if (workoutResult.length === 0) {
    return null;
  }

  const workout = workoutResult[0];

  const exercisesQuery = `
    SELECT
      e.id as exercise_id,
      e.name as exercise_name,
      s.weight_kg,
      s.reps,
      ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.id) as set_number
    FROM sets s
    JOIN exercises e ON e.id = s.exercise_id
    WHERE s.workout_id = $1
    ORDER BY e.id, s.id
  `;

  const setsData = await query<{
    exercise_id: number;
    exercise_name: string;
    weight_kg: number;
    reps: number;
    set_number: number;
  }>(exercisesQuery, [id]);

  const exercisesMap = new Map<number, ExerciseWithSets>();

  setsData.forEach((row) => {
    if (!exercisesMap.has(row.exercise_id)) {
      exercisesMap.set(row.exercise_id, {
        exercise_id: row.exercise_id,
        exercise_name: row.exercise_name,
        sets: [],
        total_volume: 0,
      });
    }

    const exercise = exercisesMap.get(row.exercise_id)!;
    const volume = row.weight_kg * row.reps;
    exercise.sets.push({
      set_number: row.set_number,
      weight_kg: row.weight_kg,
      reps: row.reps,
    });
    exercise.total_volume += volume;
  });

  const exercises = Array.from(exercisesMap.values());
  const total_volume = exercises.reduce((sum, ex) => sum + ex.total_volume, 0);
  const total_sets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return {
    ...workout,
    exercises,
    total_volume,
    total_sets,
  };
};

export const getVolumeOverTime = async (
  days: number = 30,
  groupBy: 'day' | 'week' | 'month' = 'week'
): Promise<VolumeDataPoint[]> => {
  let dateFormat = 'YYYY-MM-DD';
  let dateTrunc = 'day';

  if (groupBy === 'week') {
    dateTrunc = 'week';
  } else if (groupBy === 'month') {
    dateTrunc = 'month';
    dateFormat = 'YYYY-MM';
  }

  const volumeQuery = `
    SELECT
      TO_CHAR(DATE_TRUNC('${dateTrunc}', w.workout_date), '${dateFormat}') as date,
      COALESCE(SUM(s.weight_kg * s.reps), 0) as volume
    FROM workouts w
    LEFT JOIN sets s ON s.workout_id = w.id
    WHERE w.workout_date >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE_TRUNC('${dateTrunc}', w.workout_date)
    ORDER BY DATE_TRUNC('${dateTrunc}', w.workout_date) ASC
  `;

  const result = await query<{ date: string; volume: string }>(volumeQuery);

  return result.map((row) => ({
    date: row.date,
    volume: parseFloat(row.volume) || 0,
  }));
};
