import { query } from '../config/database';
import { SleepLog, SleepStats } from '../types';

export const getSleepLogs = async (
  startDate?: string,
  endDate?: string,
  limit: number = 30
): Promise<{ logs: SleepLog[]; stats: SleepStats }> => {
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
      duration_hours,
      quality,
      notes,
      created_at,
      updated_at
    FROM sleep_logs
    ${whereClause}
    ORDER BY log_date DESC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  const statsQuery = `
    SELECT
      AVG(duration_hours) as avg_duration,
      AVG(quality) as avg_quality,
      COUNT(*) as total_logs
    FROM sleep_logs
    ${whereClause}
  `;

  const [logs, statsResult] = await Promise.all([
    query<SleepLog>(logsQuery, params),
    query<SleepStats>(statsQuery, whereClause ? params.slice(0, -1) : []),
  ]);

  const stats: SleepStats = {
    avg_duration: statsResult[0]?.avg_duration ? Number(statsResult[0].avg_duration) : undefined,
    avg_quality: statsResult[0]?.avg_quality ? Number(statsResult[0].avg_quality) : undefined,
    total_logs: Number(statsResult[0]?.total_logs) || 0,
  };

  return { logs, stats };
};
