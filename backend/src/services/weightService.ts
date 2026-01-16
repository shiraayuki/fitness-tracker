import { query } from '../config/database';
import { WeightLog, WeightStats } from '../types';

export const getWeightLogs = async (
  startDate?: string,
  endDate?: string,
  limit: number = 30
): Promise<{ logs: WeightLog[]; stats: WeightStats }> => {
  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  if (startDate && endDate) {
    whereClause = `WHERE log_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(startDate, endDate);
    paramIndex += 2;
  } else if (startDate) {
    whereClause = `WHERE log_date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  } else if (endDate) {
    whereClause = `WHERE log_date <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const logsQuery = `
    SELECT
      id,
      log_date,
      weight_kg,
      body_fat_pct,
      notes,
      created_at,
      updated_at
    FROM weight_logs
    ${whereClause}
    ORDER BY log_date DESC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  const statsQuery = `
    SELECT
      (SELECT weight_kg FROM weight_logs ORDER BY log_date DESC LIMIT 1) as current_weight,
      (SELECT weight_kg FROM weight_logs ORDER BY log_date ASC LIMIT 1) as start_weight,
      AVG(body_fat_pct) as avg_body_fat
    FROM weight_logs
    ${whereClause}
  `;

  const [logs, statsResult] = await Promise.all([
    query<WeightLog>(logsQuery, params),
    query<{
      current_weight?: number;
      start_weight?: number;
      avg_body_fat?: number;
    }>(statsQuery, whereClause ? params.slice(0, -1) : []),
  ]);

  const current = statsResult[0]?.current_weight ? Number(statsResult[0].current_weight) : undefined;
  const start = statsResult[0]?.start_weight ? Number(statsResult[0].start_weight) : undefined;

  const stats: WeightStats = {
    current_weight: current,
    start_weight: start,
    weight_change: current && start ? current - start : undefined,
    avg_body_fat: statsResult[0]?.avg_body_fat ? Number(statsResult[0].avg_body_fat) : undefined,
  };

  return { logs, stats };
};
