import mongoose, { Schema, Document } from 'mongoose';

// Define types for academic records
interface ISemesterRecord {
  semester: number;
  sgpa: number;
}

interface IAcademicInfo {
  semesterRecords: ISemesterRecord[];
  cgpa: number;
  backlogs: number[];
  currentSemester: number;
  year: number;
}

interface IStudentProfile {
  registrationNo: string;
  profilePic?: string;
  academicInfo: IAcademicInfo;
  phone: string;
  email: string;
  dateOfBirth: string;
  department: string;
  fatherName?: string;
  motherName?: string;
}

interface IEmployeeProfile {
  employeeId: string;
  profilePic?: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  department: string;
}

interface IAdminProfile {
  collegeName: string;
  profilePic?: string;
  phone: string;
  email: string;
  dateOfBirth: string;
}

// Main profile interface
export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'student' | 'teacher' | 'tpo' | 'admin';
  studentInfo?: IStudentProfile;
  employeeInfo?: IEmployeeProfile;
  adminInfo?: IAdminProfile;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'tpo', 'admin'],
      required: true,
    },
    studentInfo: {
      registrationNo: { type: String },
      profilePic: { type: String },
      academicInfo: {
        semesterRecords: [{
          semester: Number,
          sgpa: Number,
        }],
        cgpa: Number,
        backlogs: [Number],
        currentSemester: Number,
        year: Number,
      },
      phone: { type: String },
      email: { type: String },
      dateOfBirth: { type: String },
      department: { type: String },
      fatherName: { type: String },
      motherName: { type: String },
    },
    employeeInfo: {
      employeeId: { type: String },
      profilePic: { type: String },
      phone: { type: String },
      email: { type: String },
      dateOfBirth: { type: String },
      department: { type: String },
    },
    adminInfo: {
      collegeName: { type: String },
      profilePic: { type: String },
      phone: { type: String },
      email: { type: String },
      dateOfBirth: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProfile>('Profile', profileSchema);