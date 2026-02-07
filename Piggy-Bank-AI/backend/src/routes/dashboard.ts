import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDashboardData,
  getAnalytics,
} from '../controllers/dashboardController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard data
router.get('/', getDashboardData);
router.get('/analytics', getAnalytics);

export default router;
