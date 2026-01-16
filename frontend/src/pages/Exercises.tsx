import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { exercisesAPI } from '../services/api';
import type { Exercise } from '../types';
import ExerciseProgressChart from '../components/charts/ExerciseProgressChart';

interface ExerciseHistorySet {
  set_number: number;
  weight_kg: number;
  reps: number;
}

interface ExerciseHistoryEntry {
  workout_id: number;
  workout_name: string;
  date: string;
  sets: ExerciseHistorySet[];
  max_weight: number;
  total_volume: number;
}

const Exercises: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 90));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [groupBy, setGroupBy] = useState<'date' | 'workout'>('date');
  const [metric, setMetric] = useState<'max_weight' | 'total_volume' | 'max_reps'>('max_weight');

  const {
    data: exercisesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exercisesAPI.getExercises(),
  });

  const {
    data: historyData,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ['exercise-history', selectedExerciseId],
    queryFn: () => exercisesAPI.getExerciseHistory(selectedExerciseId!, 100),
    enabled: !!selectedExerciseId,
  });

  const {
    data: progressData,
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ['exercise-progress', selectedExerciseId, metric],
    queryFn: () => exercisesAPI.getExerciseProgress(selectedExerciseId!, { metric, days: 365 }),
    enabled: !!selectedExerciseId,
  });

  // Filter history by date range
  const filteredHistory = useMemo(() => {
    if (!historyData?.history) return [];

    return historyData.history.filter((entry: ExerciseHistoryEntry) => {
      const entryDate = parseISO(entry.date);
      if (startDate && endDate) {
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      }
      return true;
    });
  }, [historyData, startDate, endDate]);

  // Group history by workout name if selected
  const groupedHistory = useMemo(() => {
    if (groupBy === 'date') {
      return filteredHistory;
    }

    // Group by workout name
    const groups = new Map<string, ExerciseHistoryEntry[]>();
    filteredHistory.forEach((entry: ExerciseHistoryEntry) => {
      const key = entry.workout_name;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.entries()).map(([workoutName, entries]) => ({
      workoutName,
      entries: entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      avgVolume: entries.reduce((sum, e) => sum + e.total_volume, 0) / entries.length,
      maxWeight: Math.max(...entries.map(e => e.max_weight)),
      count: entries.length,
    }));
  }, [filteredHistory, groupBy]);

  // Filter progress data by date range
  const filteredProgressData = useMemo(() => {
    if (!progressData?.data) return [];

    return progressData.data.filter((point) => {
      const pointDate = parseISO(point.date);
      if (startDate && endDate) {
        return isWithinInterval(pointDate, { start: startDate, end: endDate });
      }
      return true;
    });
  }, [progressData, startDate, endDate]);

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
        Failed to load exercises. Please try again later.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Exercises
        </Typography>

        {/* Filter Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Group By</InputLabel>
                  <Select
                    value={groupBy}
                    label="Group By"
                    onChange={(e) => setGroupBy(e.target.value as 'date' | 'workout')}
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="workout">Workout Name</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chart Metric</InputLabel>
                  <Select
                    value={metric}
                    label="Chart Metric"
                    onChange={(e) => setMetric(e.target.value as typeof metric)}
                  >
                    <MenuItem value="max_weight">Max Weight</MenuItem>
                    <MenuItem value="total_volume">Total Volume</MenuItem>
                    <MenuItem value="max_reps">Max Reps</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Exercise List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  All Exercises
                </Typography>
                {exercisesData?.exercises.map((exercise: Exercise) => (
                  <Box
                    key={exercise.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: selectedExerciseId === exercise.id ? 'primary.dark' : 'bgCard',
                      color: selectedExerciseId === exercise.id ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        /* bgcolor: selectedExerciseId === exercise.id ? 'primary.main' : 'grey.200', */

                      },
                    }}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <Typography variant="body1" fontWeight="medium">
                      {exercise.name}
                    </Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${exercise.total_sets} sets`}
                        size="small"
                        sx={{
                          color: selectedExerciseId === exercise.id ? 'white' : undefined,
                          bgcolor: selectedExerciseId === exercise.id ? 'rgba(255,255,255,0.2)' : undefined,
                        }}
                      />
                      {exercise.max_weight > 0 && (
                        <Chip
                          label={`Max: ${Number(exercise.max_weight).toFixed(1)} kg`}
                          size="small"
                          sx={{
                            color: selectedExerciseId === exercise.id ? 'white' : undefined,
                            bgcolor: selectedExerciseId === exercise.id ? 'rgba(255,255,255,0.2)' : undefined,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise Details */}
          <Grid item xs={12} md={8}>
            {selectedExerciseId ? (
              <Box>
                {/* Progress Chart */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {historyData?.exercise_name} - Progress
                    </Typography>
                    {progressLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : filteredProgressData.length > 0 ? (
                      <ExerciseProgressChart
                        data={filteredProgressData}
                        metric={metric}
                      />
                    ) : (
                      <Typography color="text.secondary" textAlign="center" py={4}>
                        No data for selected date range
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* History */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      History ({filteredHistory.length} workouts)
                    </Typography>
                    {historyLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : groupBy === 'workout' ? (
                      // Grouped by workout name
                      groupedHistory.map((group: any) => (
                        <Accordion key={group.workoutName}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {group.workoutName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={`${group.count}x`} size="small" color="primary" />
                                <Chip label={`Max: ${Number(group.maxWeight).toFixed(1)} kg`} size="small" />
                                <Chip label={`Avg Vol: ${Number(group.avgVolume).toFixed(0)} kg`} size="small" />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {group.entries.map((entry: ExerciseHistoryEntry) => (
                              <Box key={entry.workout_id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {format(parseISO(entry.date), 'PPP', { locale: de })}
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Set</TableCell>
                                      <TableCell align="right">Weight</TableCell>
                                      <TableCell align="right">Reps</TableCell>
                                      <TableCell align="right">Volume</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {entry.sets.map((set) => (
                                      <TableRow key={set.set_number}>
                                        <TableCell>{set.set_number}</TableCell>
                                        <TableCell align="right">{Number(set.weight_kg).toFixed(1)} kg</TableCell>
                                        <TableCell align="right">{set.reps}</TableCell>
                                        <TableCell align="right">{(Number(set.weight_kg) * Number(set.reps)).toFixed(0)} kg</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      // Grouped by date (default)
                      filteredHistory.map((entry: ExerciseHistoryEntry) => (
                        <Accordion key={entry.workout_id}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {format(parseISO(entry.date), 'PPP', { locale: de })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {entry.workout_name}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={`${entry.sets.length} sets`} size="small" />
                                <Chip label={`${Number(entry.max_weight).toFixed(1)} kg`} size="small" color="primary" />
                                <Chip label={`${Number(entry.total_volume).toFixed(0)} kg vol`} size="small" />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Set</TableCell>
                                  <TableCell align="right">Weight</TableCell>
                                  <TableCell align="right">Reps</TableCell>
                                  <TableCell align="right">Volume</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {entry.sets.map((set) => (
                                  <TableRow key={set.set_number}>
                                    <TableCell>{set.set_number}</TableCell>
                                    <TableCell align="right">{Number(set.weight_kg).toFixed(1)} kg</TableCell>
                                    <TableCell align="right">{set.reps}</TableCell>
                                    <TableCell align="right">{(Number(set.weight_kg) * Number(set.reps)).toFixed(0)} kg</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Card>
                <CardContent>
                  <Typography color="text.secondary" textAlign="center" py={8}>
                    Select an exercise from the list to view details and progress
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Exercises;
