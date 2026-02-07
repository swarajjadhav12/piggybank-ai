import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Chat endpoint (authenticated)
router.post('/', authenticateToken, chatController.sendMessage);

export default router;


