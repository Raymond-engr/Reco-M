import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  role: 'user' | 'admin';
  watchlist: mongoose.Types.ObjectId[];
  searchHistory: mongoose.Types.ObjectId[];
  lastLogin?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't return password in queries
    required: function() {
      return !this.googleId; // Password required only if not using Google auth
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshToken: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  watchlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  searchHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'SearchHistory'
  }],
  lastLogin: Date
}, {
  timestamps: true
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
UserSchema.methods.generateVerificationToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  return token;
};

export default mongoose.model<IUser>('User', UserSchema, 'Users');