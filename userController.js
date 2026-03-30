import { catchAsync } from './errorMiddleware.js';
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