import express from 'express';
import { getMe, updateMyChildren, updateDriverProfile } from './userController.js';
import { protect, restrictTo } from './authMiddleware.js';

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/update-children', restrictTo('parent'), updateMyChildren);
router.patch('/update-driver-profile', restrictTo('driver'), updateDriverProfile);

export default router;