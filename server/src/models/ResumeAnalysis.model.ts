import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  resumeName: string;
  atsScore: number;
  jdMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  weakSections: string[];
  strongSections: string[];
  suggestions: string[];
  warnings: string[];
  createdAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    resumeName: { type: String, required: true },
    atsScore: { type: Number, required: true },
    jdMatchPercentage: { type: Number, required: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    weakSections: { type: [String], default: [] },
    strongSections: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    warnings: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ResumeAnalysis =
  mongoose.models.ResumeAnalysis ||
  mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);

export default ResumeAnalysis;

