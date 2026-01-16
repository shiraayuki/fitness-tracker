import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as exerciseService from '../services/exerciseService';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exercises = await exerciseService.getExercises();
    res.json({ exercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

router.get('/:id/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    const result = await exerciseService.getExerciseHistory(id, limit);
    res.json(result);
  } catch (error: any) {
    console.error('Get exercise history error:', error);
    if (error.message === 'Exercise not found') {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
});

router.get('/:id/progress', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const metric = (req.query.metric as 'max_weight' | 'total_volume' | 'max_reps') || 'max_weight';
    const days = Math.min(parseInt(req.query.days as string) || 90, 365);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    if (!['max_weight', 'total_volume', 'max_reps'].includes(metric)) {
      res.status(400).json({ error: 'Invalid metric parameter' });
      return;
    }

    const result = await exerciseService.getExerciseProgress(id, metric, days);
    res.json(result);
  } catch (error: any) {
    console.error('Get exercise progress error:', error);
    if (error.message === 'Exercise not found') {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch exercise progress' });
  }
});

export default router;
