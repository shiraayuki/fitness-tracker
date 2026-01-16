import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import ScaleIcon from '@mui/icons-material/Scale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { workoutsAPI, sleepAPI, weightAPI } from '../services/api';
import { colors } from '../theme';
import StatCard from '../components/ui/StatCard';

const Dashboard: React.FC = () => {
  const { data: workoutsData, isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts-dashboard'],
    queryFn: () => workoutsAPI.getWorkouts({ limit: 10 }),
  });

  const { data: sleepData, isLoading: sleepLoading } = useQuery({
    queryKey: ['sleep-dashboard'],
    queryFn: () => sleepAPI.getSleepLogs({ limit: 7 }),
  });

  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ['weight-dashboard'],
    queryFn: () => weightAPI.getWeightLogs({ limit: 7 }),
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['volume-dashboard'],
    queryFn: () => workoutsAPI.getVolumeOverTime({ days: 30, groupBy: 'week' }),
  });

  const totalWorkouts = workoutsData?.total || 0;
  const avgVolume = volumeData?.data && volumeData.data.length > 0
    ? volumeData.data.reduce((sum, d) => sum + d.volume, 0) / volumeData.data.length
    : 0;
  const avgSleep = sleepData?.stats.avg_duration || 0;
  const currentWeight = weightData?.stats.current_weight || 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Workouts"
            value={workoutsLoading ? '...' : totalWorkouts}
            subtitle="All time"
            icon={<FitnessCenterIcon sx={{ fontSize: 24 }} />}
            color={colors.primary}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg Weekly Volume"
            value={volumeLoading ? '...' : `${avgVolume.toFixed(0)} kg`}
            subtitle="Last 30 days"
            icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
            color={colors.success}
            trend={{ value: 12, isPositive: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg Sleep"
            value={sleepLoading ? '...' : avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : 'N/A'}
            subtitle="Last 7 days"
            icon={<BedtimeIcon sx={{ fontSize: 24 }} />}
            color={colors.info}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Current Weight"
            value={weightLoading ? '...' : currentWeight > 0 ? `${currentWeight.toFixed(1)} kg` : 'N/A'}
            subtitle="Latest measurement"
            icon={<ScaleIcon sx={{ fontSize: 24 }} />}
            color={colors.warning}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          {workoutsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {workoutsData?.workouts.slice(0, 5).map((workout, index) => (
                <Box
                  key={workout.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    py: 2,
                    borderBottom: index < 4 ? `1px solid ${alpha(colors.border, 0.2)}` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: alpha(colors.bgCardHover, 0.3),
                      mx: -2,
                      px: 2,
                      borderRadius: 2,
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.2)} 0%, ${alpha(colors.primary, 0.1)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FitnessCenterIcon sx={{ color: colors.primary }} />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {workout.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(workout.workout_date), 'EEEE, d. MMMM', { locale: de })}
                    </Typography>
                  </Box>

                  {/* Stats */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" fontWeight={600} sx={{ color: colors.success }}>
                      {Number(workout.total_volume).toFixed(0)} kg
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workout.exercise_count} exercises
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
