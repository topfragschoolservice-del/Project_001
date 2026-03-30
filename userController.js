import { catchAsync } from './errorMiddleware.js';
import AppError from './appError.js';
import User from './User.js';

/**
 * Returns the profile of the currently authenticated user
 */
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

/**
 * Updates the children list for a parent
 */
export const updateMyChildren = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { children: req.body.children },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Updates driver-specific fields (vehicle details, status)
 */
export const updateDriverProfile = catchAsync(async (req, res, next) => {
  const { vehicleDetails, status } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { vehicleDetails, status },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

/**
 * Admin: Get all users
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

/**
 * Admin: Get single user by ID
 */
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Admin: Update user details
 */
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Admin: Delete user
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});