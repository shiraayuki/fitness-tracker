import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, alpha } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { colors } from '../../theme';

interface ExerciseProgressChartProps {
  data: Array<{ date: string; value: number }>;
  metric: 'max_weight' | 'total_volume' | 'max_reps';
}

const metricConfig = {
  max_weight: {
    label: 'Max Weight',
    color: colors.primary,
    unit: 'kg',
  },
  total_volume: {
    label: 'Total Volume',
    color: colors.success,
    unit: 'kg',
  },
  max_reps: {
    label: 'Max Reps',
    color: colors.warning,
    unit: '',
  },
};

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, metric }) => {
  const config = metricConfig[metric];

  const formattedData = data.map((point) => ({
    ...point,
    displayDate: format(parseISO(point.date), 'dd.MM', { locale: de }),
    fullDate: format(parseISO(point.date), 'PPP', { locale: de }),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.bgCard} 0%, ${colors.bgSecondary} 100%)`,
            border: `1px solid ${alpha(colors.border, 0.3)}`,
            borderRadius: 2,
            p: 1.5,
            boxShadow: `0 8px 32px ${alpha('#000', 0.4)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {payload[0].payload.fullDate}
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ color: config.color }}>
            {Number(payload[0].value).toFixed(1)} {config.unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={config.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={alpha(colors.border, 0.2)}
          vertical={false}
        />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.textSecondary, fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.textSecondary, fontSize: 12 }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={config.color}
          strokeWidth={3}
          fill={`url(#gradient-${metric})`}
          dot={{ r: 0 }}
          activeDot={{
            r: 6,
            fill: config.color,
            stroke: colors.bgCard,
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ExerciseProgressChart;
