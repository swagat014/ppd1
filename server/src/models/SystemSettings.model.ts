import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  logoUrl?: string;
  appearance: {
    primaryColor: string;
    darkMode: boolean;
  };
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    siteName: {
      type: String,
      default: 'ZestPrep Placement Dashboard',
    },
    contactEmail: {
      type: String,
      default: 'admin@zestprep.com',
    },
    contactPhone: {
      type: String,
      default: '+91 1234567890',
    },
    address: {
      type: String,
      default: 'Technical Campus, Patna, Bihar',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    appearance: {
      primaryColor: {
        type: String,
        default: '#00ff64',
      },
      darkMode: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
