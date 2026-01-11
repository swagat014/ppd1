import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string; // Arrays, Trees, Graphs, DP, etc.
  pattern: string; // Two Pointers, Sliding Window, etc.
  companies: string[]; // Google, Microsoft, Amazon, etc.
  tags: string[];
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isPublic: boolean;
  }>;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints: string[];
  solution: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code?: string;
  };
  submissions: number;
  acceptanceRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    companies: [{
      type: String,
    }],
    tags: [{
      type: String,
    }],
    testCases: [{
      input: Schema.Types.Mixed,
      expectedOutput: Schema.Types.Mixed,
      isPublic: {
        type: Boolean,
        default: false,
      },
    }],
    constraints: {
      type: String,
      required: true,
    },
    examples: [{
      input: String,
      output: String,
      explanation: String,
    }],
    hints: [String],
    solution: {
      approach: String,
      timeComplexity: String,
      spaceComplexity: String,
      code: String,
    },
    submissions: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProblem>('Problem', problemSchema);
