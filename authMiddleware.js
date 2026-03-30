import jwt from 'jsonwebtoken';
import { catchAsync } from './errorMiddleware.js';
import AppError from './appError.js';
import User from './User.js';

/**
 * Middleware to protect routes - ensures the user is authenticated via JWT
 */
export const protect = catchAsync(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  // jwt.verify will throw an error if the token is invalid or expired
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Grant access: Attach user to the request object
  req.user = currentUser;
  next();
});

/**
 * Middleware to restrict access based on user roles
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'driver')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};