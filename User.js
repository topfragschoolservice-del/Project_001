import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Ensures password isn't returned in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  role: {
    type: String,
    enum: ['parent', 'driver', 'admin'],
    required: true,
    default: 'parent'
  },
  // Profile-specific fields
  children: [{
    name: { type: String, required: true }
  }],
  vehicleDetails: { type: String },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);