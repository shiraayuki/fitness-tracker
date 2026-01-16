import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { format } from 'date-fns';
import { weightAPI } from '../services/api';
import WeightChart from '../components/charts/WeightChart';

const Weight: React.FC = () => {
  const {
    data: weightData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weight'],
    queryFn: () => weightAPI.getWeightLogs({ limit: 30 }),
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
        Failed to load weight data. Please try again later.
      </Alert>
    );
  }

  const { logs, stats } = weightData || { logs: [], stats: {} };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Weight Tracking
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Weight
              </Typography>
              <Typography variant="h4">
                {stats.current_weight ? `${stats.current_weight.toFixed(1)} kg` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Start Weight
              </Typography>
              <Typography variant="h4">
                {stats.start_weight ? `${stats.start_weight.toFixed(1)} kg` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Change
              </Typography>
              <Typography
                variant="h4"
                color={
                  stats.weight_change
                    ? stats.weight_change < 0
                      ? 'success.main'
                      : 'error.main'
                    : 'text.primary'
                }
              >
                {stats.weight_change
                  ? `${stats.weight_change > 0 ? '+' : ''}${stats.weight_change.toFixed(1)} kg`
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Body Fat
              </Typography>
              <Typography variant="h4">
                {stats.avg_body_fat ? `${stats.avg_body_fat.toFixed(1)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weight Chart */}
      {logs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weight Trend
            </Typography>
            <WeightChart data={logs} />
          </CardContent>
        </Card>
      )}

      {/* Weight Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weight Log History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Weight (kg)</TableCell>
                  <TableCell align="right">Body Fat %</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        No weight logs yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.log_date), 'PP')}
                      </TableCell>
                      <TableCell align="right">{Number(log.weight_kg).toFixed(1)}</TableCell>
                      <TableCell align="right">
                        {log.body_fat_pct ? log.body_fat_pct.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell>{log.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Weight;
