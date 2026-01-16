import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SleepLog } from '../../types';
import { format } from 'date-fns';

interface SleepChartProps {
  data: SleepLog[];
}

const SleepChart: React.FC<SleepChartProps> = ({ data }) => {
  const chartData = data
    .map((log) => ({
      date: format(new Date(log.log_date), 'MM/dd'),
      duration: log.duration_hours || 0,
      quality: log.quality || 0,
    }))
    .reverse();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 5]}
          label={{ value: 'Quality', angle: 90, position: 'insideRight' }}
        />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="duration" fill="#8884d8" name="Duration (hours)" />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="quality"
          stroke="#82ca9d"
          strokeWidth={2}
          name="Quality (1-5)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default SleepChart;
