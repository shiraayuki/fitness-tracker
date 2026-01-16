import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { AuthResponse } from '../types';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    if (!authConfig.adminPasswordHash) {
      res.status(500).json({ error: 'Server authentication not configured' });
      return;
    }

    const isValid = await bcrypt.compare(password, authConfig.adminPasswordHash);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      { user: 'admin' },
      authConfig.jwtSecret,
      { expiresIn: authConfig.tokenExpiry } as jwt.SignOptions
    );

    const response: AuthResponse = {
      token,
      expires_in: 86400, // 24 hours in seconds
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
