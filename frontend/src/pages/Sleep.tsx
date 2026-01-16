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
import { sleepAPI } from '../services/api';
import SleepChart from '../components/charts/SleepChart';

const Sleep: React.FC = () => {
  const {
    data: sleepData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sleep'],
    queryFn: () => sleepAPI.getSleepLogs({ limit: 30 }),
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
        Failed to load sleep data. Please try again later.
      </Alert>
    );
  }

  const { logs, stats } = sleepData || { logs: [], stats: { total_logs: 0 } };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sleep Tracking
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Duration
              </Typography>
              <Typography variant="h4">
                {stats.avg_duration ? `${stats.avg_duration.toFixed(1)}h` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Quality
              </Typography>
              <Typography variant="h4">
                {stats.avg_quality ? `${stats.avg_quality.toFixed(1)}/5` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h4">{stats.total_logs}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sleep Chart */}
      {logs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sleep Duration & Quality
            </Typography>
            <SleepChart data={logs} />
          </CardContent>
        </Card>
      )}

      {/* Sleep Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sleep Log History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Duration (hours)</TableCell>
                  <TableCell align="right">Quality (1-5)</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        No sleep logs yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.log_date), 'PP')}
                      </TableCell>
                      <TableCell align="right">
                        {log.duration_hours || '-'}
                      </TableCell>
                      <TableCell align="right">{log.quality || '-'}</TableCell>
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

export default Sleep;
