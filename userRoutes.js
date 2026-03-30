import express from 'express';
import { getMe, updateMyChildren } from './userController.js';
import { protect, restrictTo } from './authMiddleware.js';

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/update-children', restrictTo('parent'), updateMyChildren);

export default router;