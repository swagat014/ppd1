import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'tpo' | 'admin' | 'teacher';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    year?: number;
    rollNumber?: string;
    enrollmentNumber?: string;
    course?: string;
    specialization?: string;
    dateOfBirth?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default, use .select('+password') to include
    },
    role: {
      type: String,
      enum: ['student', 'tpo', 'admin', 'teacher'],
      required: true,
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String },
      department: { type: String },
      year: { type: Number },
      rollNumber: { type: String },
      enrollmentNumber: { type: String },
      course: { type: String },
      specialization: { type: String },
      dateOfBirth: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);



// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
