import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middleware
import { authenticateToken } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import exerciseRoutes from './routes/exercises';
import sleepRoutes from './routes/sleep';
import weightRoutes from './routes/weight';

// Import database to test connection
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://192.168.188.200:5173'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required, but rate limited)
app.use('/api/auth', authLimiter, authRoutes);

// Protected API routes
app.use('/api/workouts', authenticateToken, workoutRoutes);
app.use('/api/exercises', authenticateToken, exerciseRoutes);
app.use('/api/sleep', authenticateToken, sleepRoutes);
app.use('/api/weight', authenticateToken, weightRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✓ Database connection established');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err.message);
    console.error('Please check your database configuration in .env');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
