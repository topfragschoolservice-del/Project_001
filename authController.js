import jwt from 'jsonwebtoken';
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

/**
 * Authenticates a user and returns access/refresh tokens
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists && password is correct
  // We must explicitly .select('+password') because 'select: false' is set in the schema
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(200).json({
    status: 'success',
    token: accessToken,
    refreshToken,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        children: user.children
      }
    }
  });
});

/**
 * Logs out the user
 * Note: In a stateless JWT setup, the client must delete the tokens.
 */
export const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully. Please clear your tokens on the client side.'
  });
};

/**
 * Refresh Access Token using a Refresh Token
 */
export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // 1) Verify refresh token
  // Errors like 'TokenExpiredError' will be caught by our global error handler
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // 2) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 3) Generate new tokens (Rotation)
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res.status(200).json({
    status: 'success',
    token: newAccessToken,
    refreshToken: newRefreshToken
  });
});