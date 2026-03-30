import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  // We need to use 'this.password' which is only available if we specifically select it in the query
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);