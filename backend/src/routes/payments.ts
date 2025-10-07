import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { deposit, withdraw, transfer, getWallet, getTransactions } from '../controllers/paymentsController.js';

const router = Router();

router.use(authenticateToken);

router.get('/wallet', getWallet);
router.get('/transactions', getTransactions);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);

export default router;
