import { catchAsync } from './errorMiddleware.js';

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