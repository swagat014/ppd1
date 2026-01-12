import mongoose, { Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Department = mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;