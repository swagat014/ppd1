import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  role: string;
  location: string;
  deadline: Date;
  eventType: 'Application' | 'Selection' | 'Workshop' | 'Simulation';
  description: string;
  link?: string;
  logo?: string;
  isActive: boolean;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
    eventType: { 
      type: String, 
      enum: ['Application', 'Selection', 'Workshop', 'Simulation'],
      default: 'Application'
    },
    description: { type: String, required: true },
    link: String,
    logo: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', companySchema);
