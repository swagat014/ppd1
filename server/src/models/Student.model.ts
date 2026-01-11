import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  fathers_name: string;
  phone: string;
  date_of_birth: string;
  resume: {
    fileUrl?: string;
    fileName?: string;
    uploadedAt?: Date;
    atsScore?: number;
    analysis?: {
      keywords: string[];
      missingKeywords: string[];
      suggestions: string[];
      readabilityScore: number;
    };
  };
  readiness: {
    overallScore: number;
    technicalScore: number;
    aptitudeScore: number;
    communicationScore: number;
    projectsScore: number;
    skillsScore: number;
    lastAnalyzed: Date;
    recommendations: string[];
  };
  practice: {
    dsa: {
      totalProblems: number;
      solvedProblems: number;
      accuracy: number;
      companySpecific: Map<string, {
        solved: number;
        total: number;
        accuracy: number;
      }>;
      patternBased: Map<string, {
        solved: number;
        total: number;
        accuracy: number;
      }>;
      recentActivity: Array<{
        problemId: string;
        date: Date;
        status: 'solved' | 'attempted' | 'skipped';
      }>;
    };
    aptitude: {
      totalTests: number;
      completedTests: number;
      averageScore: number;
      companySpecific: Map<string, {
        completed: number;
        averageScore: number;
      }>;
      weakAreas: string[];
      recentActivity: Array<{
        testId: string;
        date: Date;
        score: number;
      }>;
    };
  };
  interviews: Array<{
    interviewId: string;
    type: 'technical' | 'hr' | 'managerial';
    date: Date;
    score: number;
    feedback: {
      strengths: string[];
      weaknesses: string[];
      overall: string;
    };
    recording?: string;
  }>;
  english: {
    overallScore: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    writing: number;
    lastAnalyzed: Date;
    improvements: string[];
  };
  coreSubjects: Map<string, {
    score: number;
    completedModules: number;
    totalModules: number;
    lastAccessed: Date;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    suggested: boolean;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    suggested: string[];
  };
  analytics: {
    dailyProgress: Array<{
      date: Date;
      dsaProblems: number;
      aptitudeTests: number;
      studyHours: number;
    }>;
    weeklyGoals: {
      dsaProblems: number;
      aptitudeTests: number;
      studyHours: number;
    };
    achievements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fathers_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: String,
      required: true,
    },
    resume: {
      fileUrl: String,
      fileName: String,
      uploadedAt: Date,
      atsScore: Number,
      analysis: {
        keywords: [String],
        missingKeywords: [String],
        suggestions: [String],
        readabilityScore: Number,
      },
    },
    readiness: {
      overallScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      aptitudeScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      projectsScore: { type: Number, default: 0 },
      skillsScore: { type: Number, default: 0 },
      lastAnalyzed: Date,
      recommendations: [String],
    },
    practice: {
      dsa: {
        totalProblems: { type: Number, default: 0 },
        solvedProblems: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        companySpecific: {
          type: Map,
          of: {
            solved: Number,
            total: Number,
            accuracy: Number,
          },
        },
        patternBased: {
          type: Map,
          of: {
            solved: Number,
            total: Number,
            accuracy: Number,
          },
        },
        recentActivity: [{
          problemId: String,
          date: Date,
          status: {
            type: String,
            enum: ['solved', 'attempted', 'skipped'],
          },
        }],
      },
      aptitude: {
        totalTests: { type: Number, default: 0 },
        completedTests: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        companySpecific: {
          type: Map,
          of: {
            completed: Number,
            averageScore: Number,
          },
        },
        weakAreas: [String],
        recentActivity: [{
          testId: String,
          date: Date,
          score: Number,
        }],
      },
    },
    interviews: [{
      interviewId: String,
      type: {
        type: String,
        enum: ['technical', 'hr', 'managerial'],
      },
      date: Date,
      score: Number,
      feedback: {
        strengths: [String],
        weaknesses: [String],
        overall: String,
      },
      recording: String,
    }],
    english: {
      overallScore: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      vocabulary: { type: Number, default: 0 },
      pronunciation: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
      lastAnalyzed: Date,
      improvements: [String],
    },
    coreSubjects: {
      type: Map,
      of: {
        score: Number,
        completedModules: Number,
        totalModules: Number,
        lastAccessed: Date,
      },
    },
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      githubUrl: String,
      liveUrl: String,
      suggested: Boolean,
    }],
    skills: {
      technical: [String],
      soft: [String],
      suggested: [String],
    },
    analytics: {
      dailyProgress: [{
        date: Date,
        dsaProblems: Number,
        aptitudeTests: Number,
        studyHours: Number,
      }],
      weeklyGoals: {
        dsaProblems: { type: Number, default: 10 },
        aptitudeTests: { type: Number, default: 3 },
        studyHours: { type: Number, default: 20 },
      },
      achievements: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', studentSchema);
