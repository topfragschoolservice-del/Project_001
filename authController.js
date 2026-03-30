import User from './User.js';
import { catchAsync } from './errorMiddleware.js';
import AppError from './appError.js';
import { generateAccessToken, generateRefreshToken } from './authUtils.js';

/**
 * Registers a new user and returns access/refresh tokens
 */
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, children, vehicleDetails } = req.body;

  // 1) Check if user already exists (Mongoose 'unique' handles this, but we can be explicit)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  // 2) Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    phone,
    children,
    vehicleDetails
  });

  // 3) Generate tokens
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  res.status(201).json({
    status: 'success',
    token: accessToken,
    refreshToken,
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        children: newUser.children
      }
    }
  });
});