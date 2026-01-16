import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as sleepService from '../services/sleepService';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 365);

    const result = await sleepService.getSleepLogs(startDate, endDate, limit);
    res.json(result);
  } catch (error) {
    console.error('Get sleep logs error:', error);
    res.status(500).json({ error: 'Failed to fetch sleep logs' });
  }
});

export default router;
