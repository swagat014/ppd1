import mongoose, { Schema, Document } from 'mongoose';

export interface IAptitudeTest extends Document {
  title: string;
  description: string;
  type: 'quantitative' | 'logical' | 'verbal' | 'mixed';
  companies: string[];
  duration: number; // in minutes
  totalQuestions: number;
  questions: Array<{
    questionId: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
  }>;
  passingScore: number;
  attempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const aptitudeTestSchema = new Schema<IAptitudeTest>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['quantitative', 'logical', 'verbal', 'mixed'],
      required: true,
    },
    companies: [String],
    duration: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    questions: [{
      questionId: String,
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
      },
      topic: String,
    }],
    passingScore: {
      type: Number,
      default: 60,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAptitudeTest>('AptitudeTest', aptitudeTestSchema);
