import express from 'express';
import { getMe } from './userController.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

router.get('/me', getMe);

export default router;