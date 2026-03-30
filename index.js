import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './middleware/errorMiddleware.js';
import AppError from './utils/appError.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1) Global Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS

// Rate limiting: Max 100 requests per 15 mins from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

app.use(express.json());
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Transport API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Middleware
app.use(globalErrorHandler);

// Database Connection & Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();