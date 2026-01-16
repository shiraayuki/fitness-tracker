import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import { workoutsAPI } from '../services/api';
import type { Workout } from '../types';
import VolumeChart from '../components/charts/VolumeChart';

const Workouts: React.FC = () => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  const {
    data: workoutsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutsAPI.getWorkouts({ limit: 50 }),
  });

  const {
    data: volumeData,
    isLoading: volumeLoading,
  } = useQuery({
    queryKey: ['volume-over-time'],
    queryFn: () => workoutsAPI.getVolumeOverTime({ days: 90, groupBy: 'week' }),
  });

  const {
    data: workoutDetail,
    isLoading: detailLoading,
  } = useQuery({
    queryKey: ['workout', selectedWorkoutId],
    queryFn: () => workoutsAPI.getWorkoutById(selectedWorkoutId!),
    enabled: !!selectedWorkoutId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load workouts. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Workouts
      </Typography>

      {/* Volume Chart */}
      {!volumeLoading && volumeData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Volume Trend (Last 90 Days)
            </Typography>
            <VolumeChart data={volumeData.data} />
          </CardContent>
        </Card>
      )}

      {/* Workouts Grid */}
      <Grid container spacing={3}>
        {workoutsData?.workouts.map((workout: Workout) => (
          <Grid item xs={12} sm={6} md={4} key={workout.id}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => setSelectedWorkoutId(workout.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  {workout.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {format(new Date(workout.workout_date), 'PPP')}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${workout.exercise_count} exercises`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${workout.total_sets} sets`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${Number(workout.total_volume).toFixed(0)} kg volume`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Workout Detail Dialog */}
      <Dialog
        open={!!selectedWorkoutId}
        onClose={() => setSelectedWorkoutId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{workoutDetail?.name}</Typography>
            <IconButton onClick={() => setSelectedWorkoutId(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {workoutDetail && (
            <Typography variant="body2" color="text.secondary">
              {format(new Date(workoutDetail.workout_date), 'PPPp')}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : workoutDetail ? (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Chip
                  label={`Total Volume: ${Number(workoutDetail.total_volume).toFixed(0)} kg`}
                  color="primary"
                />
                <Chip
                  label={`Total Sets: ${workoutDetail.total_sets}`}
                  color="secondary"
                />
              </Box>

              {workoutDetail.exercises.map((exercise, index) => (
                <Accordion key={index} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                      <Typography variant="h6">{exercise.exercise_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Number(exercise.total_volume).toFixed(0)} kg
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Set</TableCell>
                          <TableCell align="right">Weight (kg)</TableCell>
                          <TableCell align="right">Reps</TableCell>
                          <TableCell align="right">Volume (kg)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exercise.sets.map((set) => (
                          <TableRow key={set.set_number}>
                            <TableCell>{set.set_number}</TableCell>
                            <TableCell align="right">{set.weight_kg}</TableCell>
                            <TableCell align="right">{set.reps}</TableCell>
                            <TableCell align="right">
                              {(Number(set.weight_kg) * Number(set.reps)).toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Workouts;
