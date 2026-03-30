import express from 'express';
import { 
  getMe, 
  updateMyChildren, 
  updateDriverProfile,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser 
} from './userController.js';
import { protect, restrictTo } from './authMiddleware.js';

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/update-children', restrictTo('parent'), updateMyChildren);
router.patch('/update-driver-profile', restrictTo('driver'), updateDriverProfile);

// Admin only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;