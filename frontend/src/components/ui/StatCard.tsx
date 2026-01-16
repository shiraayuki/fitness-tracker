import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { colors } from '../../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
  trend,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(colors.bgCard, 0.8)} 0%, ${alpha(colors.bgSecondary, 0.6)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(colors.border, 0.3)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(color, 0.4),
          boxShadow: `0 20px 40px ${alpha('#000', 0.3)}, 0 0 0 1px ${alpha(color, 0.2)}`,
        },
      }}
    >
      {/* Background gradient accent */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              background: alpha(trend.isPositive ? colors.success : colors.error, 0.15),
              color: trend.isPositive ? colors.success : colors.error,
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
          </Box>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${alpha(colors.textPrimary, 0.8)} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
        }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default StatCard;
