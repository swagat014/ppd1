import mongoose, { Schema, Document } from 'mongoose';

export interface ICoreSubjectNote extends Document {
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: mongoose.Types.ObjectId; // Reference to teacher
  department: string; // e.g., 'CSE'
  subject: string; // e.g., 'Data Structures', 'Algorithms'
  semester: number;
  academicYear: string;
  isPublic: boolean;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoreSubjectNoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
CoreSubjectNoteSchema.index({ department: 1, subject: 1, semester: 1 });
CoreSubjectNoteSchema.index({ uploadedBy: 1 });

export default mongoose.model<ICoreSubjectNote>('CoreSubjectNote', CoreSubjectNoteSchema);