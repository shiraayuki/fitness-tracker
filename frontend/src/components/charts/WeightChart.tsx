import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeightLog } from '../../types';
import { format } from 'date-fns';

interface WeightChartProps {
  data: WeightLog[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const chartData = data
    .map((log) => ({
      date: format(new Date(log.log_date), 'MM/dd'),
      weight: log.weight_kg,
      bodyFat: log.body_fat_pct || null,
    }))
    .reverse();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'Body Fat %', angle: 90, position: 'insideRight' }}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="weight"
          stroke="#1976d2"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Weight (kg)"
        />
        {chartData.some((d) => d.bodyFat !== null) && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="bodyFat"
            stroke="#dc004e"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Body Fat %"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
