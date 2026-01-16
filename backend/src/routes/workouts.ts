import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as workoutService from '../services/workoutService';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await workoutService.getWorkouts(limit, offset, startDate, endDate);

    res.json({
      workouts: result.workouts,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

router.get('/stats/volume-over-time', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);
    const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'week';

    if (!['day', 'week', 'month'].includes(groupBy)) {
      res.status(400).json({ error: 'Invalid groupBy parameter' });
      return;
    }

    const data = await workoutService.getVolumeOverTime(days, groupBy);

    res.json({ data });
  } catch (error) {
    console.error('Get volume over time error:', error);
    res.status(500).json({ error: 'Failed to fetch volume statistics' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid workout ID' });
      return;
    }

    const workout = await workoutService.getWorkoutById(id);

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

export default router;
