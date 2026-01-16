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
import { VolumeDataPoint } from '../../types';
import { colors } from '../../theme';

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

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
          {format(parseISO(payload[0].payload.date), 'PPP', { locale: de })}
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ color: colors.primary }}>
          {Number(payload[0].value).toFixed(0)} kg
        </Typography>
      </Box>
    );
  }
  return null;
};

const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const formattedData = data.map((point) => ({
    ...point,
    displayDate: format(parseISO(point.date), 'dd.MM', { locale: de }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
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
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="volume"
          stroke={colors.primary}
          strokeWidth={3}
          fill="url(#volumeGradient)"
          dot={{ r: 0 }}
          activeDot={{
            r: 6,
            fill: colors.primary,
            stroke: colors.bgCard,
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;
