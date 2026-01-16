import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { colors } from '../../theme';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = colors.primary,
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(colors.border, 0.3)}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={alpha(color, 0.6)} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <Box sx={{ textAlign: 'center', zIndex: 1 }}>
        {label && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.textPrimary,
              lineHeight: 1,
            }}
          >
            {label}
          </Typography>
        )}
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              display: 'block',
              mt: 0.5,
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;
