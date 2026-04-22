import { Response } from 'express';
import Student from '../models/Student.model';
import Problem from '../models/Problem.model';
import AptitudeTest from '../models/AptitudeTest.model';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth');
import ResumeAnalysis from '../models/ResumeAnalysis.model';
import { analyzeResumeText } from '../utils/resumeAnalysis.util';

// @desc    Get leaderboard rankings
// @route   GET /api/student/leaderboard
// @access  Private
export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ];

    if (department) {
      pipeline.push({
        $match: { 'userDetails.profile.department': department }
      });
    }

    pipeline.push(
      {
        $sort: { 
          'readiness.overallScore': -1, 
          'practice.dsa.solvedProblems': -1 
        }
      },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          id: '$_id',
          name: { $concat: ['$userDetails.profile.firstName', ' ', '$userDetails.profile.lastName'] },
          department: '$userDetails.profile.department',
          overallScore: '$readiness.overallScore',
          dsaSolved: '$practice.dsa.solvedProblems',
          aptitudeScore: '$practice.aptitude.averageScore',
          streak: { $ifNull: ['$analytics.streak', 0] }
        }
      }
    );

    const rankings = await Student.aggregate(pipeline);
    
    // Efficient count for total
    const totalPipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'userDetails'
        }
      }
    ];

    const total = await Student.countDocuments(department ? { 'profile.department': department } : {});

    const students = rankings.map((s, index) => ({
      rank: skip + index + 1,
      ...s
    }));

    res.status(200).json({
      success: true,
      data: {
        rankings: students,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rankings',
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
}).single('resume');

// @desc    Get student dashboard
// @route   GET /api/student/dashboard
// @access  Private/Student
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id }).populate('userId');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Ensure practice object exists with defaults
    const practice = student.practice || {
      dsa: {
        totalProblems: 0,
        solvedProblems: 0,
        accuracy: 0,
        companySpecific: new Map(),
        patternBased: new Map(),
        recentActivity: [],
      },
      aptitude: {
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        companySpecific: new Map(),
        weakAreas: [],
        recentActivity: [],
      },
    };

    // Ensure DSA stats exist
    const dsaStats = practice.dsa || {
      totalProblems: 0,
      solvedProblems: 0,
      accuracy: 0,
      recentActivity: [],
    };

    // Ensure Aptitude stats exist
    const aptitudeStats = practice.aptitude || {
      totalTests: 0,
      completedTests: 0,
      averageScore: 0,
      recentActivity: [],
    };

    // Ensure readiness exists
    const readiness = student.readiness || {
      overallScore: 0,
      technicalScore: 0,
      aptitudeScore: 0,
      communicationScore: 0,
    };

    // Calculate analytics data
    const totalStudents = await Student.countDocuments();
    
    // Calculate streak based on daily progress
    const dailyProgress = student.analytics?.dailyProgress || [];
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasActivity = dailyProgress.some(progress => {
        const progressDate = new Date(progress.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === checkDate.getTime() && 
               (progress.dsaProblems > 0 || progress.aptitudeTests > 0 || progress.studyHours > 0);
      });
      
      if (hasActivity) {
        streak++;
      } else if (i === 0) {
        // If today has no activity, continue checking yesterday
        continue;
      } else {
        break;
      }
    }
    
    // Calculate rank based on readiness score
    const higherReadinessCount = await Student.countDocuments({
      'readiness.overallScore': { $gt: readiness.overallScore }
    });
    const rank = higherReadinessCount + 1;

    res.status(200).json({
      success: true,
      data: {
        profile: student.userId,
        resume: student.resume,
        readiness: readiness,
        practice: {
          dsa: {
            solved: dsaStats.solvedProblems || 0,
            total: dsaStats.totalProblems || 0,
            accuracy: dsaStats.accuracy || 0,
          },
          aptitude: {
            completed: aptitudeStats.completedTests || 0,
            averageScore: aptitudeStats.averageScore || 0,
          },
        },
        english: student.english,
        recentActivity: {
          dsa: (dsaStats.recentActivity || []).slice(0, 5),
          aptitude: (aptitudeStats.recentActivity || []).slice(0, 5),
          interviews: (student.interviews || []).slice(0, 3),
        },
        analytics: {
          ...student.analytics,
          streak,
          rank,
          totalStudents,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard',
    });
  }
};

// @desc    Upload resume
// @route   POST /api/student/resume/upload
// @access  Private/Student
export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  upload(req, res, async (err: any) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      const student = await Student.findOne({ userId: req.user?._id });

      if (!student) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      student.resume.fileUrl = `/uploads/resumes/${req.file.filename}`;
      student.resume.fileName = req.file.originalname;
      student.resume.uploadedAt = new Date();

      await student.save();

      res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: student.resume,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload resume',
      });
    }
  });
};

// @desc    Analyze resume
// @route   POST /api/student/resume/analyze
// @access  Private/Student
export const analyzeResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobDescription } = req.body as { jobDescription?: string };

    const student = await Student.findOne({ userId: req.user?._id });

    if (!student || !student.resume.fileUrl) {
      res.status(404).json({ success: false, message: 'Resume not found. Please upload a resume first.' });
      return;
    }

    const filePath = path.join(process.cwd(), student.resume.fileUrl);
    const dataBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let resumeText = '';
    if (ext === '.pdf') {
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      resumeText = result.value || '';
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported resume format for analysis. Please upload a PDF or DOCX file.',
      });
      return;
    }

    const analysis = analyzeResumeText({
      resumeText,
      jobDescription,
    });

    student.resume.atsScore = analysis.atsScore || 0;
    student.resume.analysis = {
      keywords: analysis.matchedSkills || [],
      missingKeywords: analysis.missingSkills || [],
      suggestions: analysis.suggestions || [],
      readabilityScore: analysis.jdMatchPercentage || 0,
    };

    await student.save();

    await ResumeAnalysis.create({
      userId: req.user?._id,
      resumeName: student.resume.fileName,
      atsScore: analysis.atsScore,
      jdMatchPercentage: analysis.jdMatchPercentage,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      weakSections: analysis.weakSections,
      strongSections: analysis.strongSections,
      suggestions: analysis.suggestions,
      warnings: analysis.warnings,
    });

    res.status(200).json({
      success: true,
      data: {
        atsScore: analysis.atsScore,
        jdMatchPercentage: analysis.jdMatchPercentage,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        weakSections: analysis.weakSections,
        strongSections: analysis.strongSections,
        suggestions: analysis.suggestions,
        warnings: analysis.warnings,
        scoreBreakdown: analysis.scoreBreakdown,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze resume',
    });
  }
};

// @desc    Get readiness analysis
// @route   GET /api/student/readiness
// @access  Private/Student
export const getReadiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: student.readiness,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get readiness',
    });
  }
};

// @desc    Analyze student readiness
// @route   POST /api/student/readiness/analyze
// @access  Private/Student
export const analyzeReadiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Calculate scores based on various factors
    const technicalScore = Math.min(100, (student.practice.dsa.solvedProblems / 100) * 100);
    const aptitudeScore = student.practice.aptitude.averageScore || 0;
    const communicationScore = student.english.overallScore || 0;
    const projectsScore = (student.projects.length / 5) * 100;
    const skillsScore = Math.min(100, ((student.skills.technical.length + student.skills.soft.length) / 20) * 100);

    const overallScore = (
      technicalScore * 0.3 +
      aptitudeScore * 0.2 +
      communicationScore * 0.2 +
      projectsScore * 0.15 +
      skillsScore * 0.15
    );

    // Generate recommendations (rule-based, no external AI)
    const recommendations: string[] = [];
    if (technicalScore < 60) recommendations.push('Focus on solving more DSA problems. Aim for at least 100 solved problems.');
    if (aptitudeScore < 60) recommendations.push('Practice more aptitude tests to improve your quantitative and logical reasoning skills.');
    if (communicationScore < 60) recommendations.push('Work on improving your English communication skills through practice and mock interviews.');
    if (projectsScore < 60) recommendations.push('Build more projects to showcase your technical skills and experience.');
    if (skillsScore < 60) recommendations.push('Learn new technologies and frameworks relevant to your target companies.');

    student.readiness = {
      overallScore: Math.round(overallScore),
      technicalScore: Math.round(technicalScore),
      aptitudeScore: Math.round(aptitudeScore),
      communicationScore: Math.round(communicationScore),
      projectsScore: Math.round(projectsScore),
      skillsScore: Math.round(skillsScore),
      lastAnalyzed: new Date(),
      recommendations: recommendations.slice(0, 10),
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: student.readiness,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze readiness',
    });
  }
};

// @desc    Submit readiness test
// @route   POST /api/student/readiness/test
// @access  Private/Student
export const submitReadinessTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers, timeTaken } = req.body; // { q_id: answerIndex }
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Fetch all aptitude and technical tests to verify answers
    const allTests = await AptitudeTest.find();
    const questionsMap = new Map();
    allTests.forEach(test => {
      test.questions.forEach(q => {
        questionsMap.set(q.questionId, q);
      });
    });

    let correct = 0;
    let aptitudeCorrect = 0;
    let technicalCorrect = 0;
    let codingCorrect = 0;
    
    let aptitudeTotal = 0;
    let technicalTotal = 0;
    let codingTotal = 0;

    const submittedQuestions = Object.entries(answers);
    const totalQuestions = submittedQuestions.length;

    submittedQuestions.forEach(([qId, answer], idx) => {
      const originalQ = questionsMap.get(qId);
      if (originalQ) {
        const isCorrect = originalQ.correctAnswer === answer;
        
        // Use a simple type mapping for the readiness test structure
        // In the getReadinessTest, aptitude is first 10, then technical, then coding
        // But better to check original question topic/type
        if (originalQ.type === 'quantitative' || originalQ.type === 'logical') {
          aptitudeTotal++;
          if (isCorrect) {
            aptitudeCorrect++;
            correct++;
          }
        } else {
          // Assume technical or other
          if (idx < 20) {
            technicalTotal++;
            if (isCorrect) {
              technicalCorrect++;
              correct++;
            }
          } else {
            codingTotal++;
            if (isCorrect) {
              codingCorrect++;
              correct++;
            }
          }
        }
      }
    });

    const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const aptitudeScore = aptitudeTotal > 0 ? (aptitudeCorrect / aptitudeTotal) * 100 : 0;
    const technicalScore = technicalTotal > 0 ? (technicalCorrect / technicalTotal) * 100 : 0;
    const codingScore = codingTotal > 0 ? (codingCorrect / codingTotal) * 100 : 0;

    // Update readiness scores based on test performance
    const testWeight = 0.5; 
    const existingWeight = 0.5;

    const newAptitudeScore = Math.round(((student.readiness.aptitudeScore || 0) * existingWeight) + (aptitudeScore * testWeight));
    const newTechnicalScore = Math.round(((student.readiness.technicalScore || 0) * existingWeight) + (technicalScore * testWeight));
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (aptitudeScore < 70) recommendations.push('Focus on Aptitude: Practice Ratios, Average, and Logical reasoning.');
    if (technicalScore < 70) recommendations.push('Strengthen Technical: Review OS, DBMS, and Algorithm complexities.');
    if (codingScore < 70) recommendations.push('Improve Coding: Practice more JS Fundamentals and pattern-based DSA.');

    student.readiness = {
      ...student.readiness,
      overallScore: Math.round(score),
      aptitudeScore: newAptitudeScore,
      technicalScore: newTechnicalScore,
      recommendations: recommendations.slice(0, 8),
      lastAnalyzed: new Date(),
    };

    if (!student.analytics.testHistory) (student.analytics as any).testHistory = [];
    (student.analytics as any).testHistory.push({
      type: 'readiness',
      score: Math.round(score),
      aptitudeScore: Math.round(aptitudeScore),
      technicalScore: Math.round(technicalScore),
      codingScore: Math.round(codingScore),
      timeTaken,
      date: new Date(),
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted and processed successfully',
      data: {
        score: Math.round(score),
        aptitudeScore: Math.round(aptitudeScore),
        technicalScore: Math.round(technicalScore),
        codingScore: Math.round(codingScore),
        sectionScores: {
          aptitude: { correct: aptitudeCorrect, total: aptitudeTotal },
          technical: { correct: technicalCorrect, total: technicalTotal },
          coding: { correct: codingCorrect, total: codingTotal },
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit test',
    });
  }
};


// @desc    Get DSA problems
// @route   GET /api/student/dsa/problems
// @access  Private/Student
export const getDSAProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, category, pattern, company, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (pattern) filter.pattern = pattern;
    if (company) filter.companies = company;

    const skip = (Number(page) - 1) * Number(limit);

    const problems = await Problem.find(filter)
      .select('-testCases -solution')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Problem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        problems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get problems',
    });
  }
};

// @desc    Get problem by ID
// @route   GET /api/student/dsa/problems/:id
// @access  Private/Student
export const getProblemById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get problem',
    });
  }
};

// Helper function to execute JavaScript code safely
const executeJavaScript = (code: string, testCase: any): { success: boolean; output: any; error?: string } => {
  try {
    // Create a safe execution context with allowed globals
    const sandbox = {
      console: {
        log: () => {}, // Suppress console.log
        error: () => {},
        warn: () => {},
      },
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      RegExp,
      Map,
      Set,
      Promise,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Infinity,
      NaN,
      undefined,
    };

    // Extract the solve function from user code
    // Support multiple patterns: function solve, const solve, var solve, let solve
    const functionPattern = /(?:function\s+solve|(?:const|let|var)\s+solve\s*=\s*(?:function)?)/;
    
    if (!functionPattern.test(code)) {
      return {
        success: false,
        output: null,
        error: 'Your code must define a function named "solve". Example: function solve(nums, target) { ... }',
      };
    }

    // Wrap the code to extract the solve function
    const wrappedCode = `
      "use strict";
      ${code}
      if (typeof solve !== 'function') {
        throw new Error('No solve function found. Make sure you define: function solve(...) { ... }');
      }
      return solve;
    `;

    // Create function from code
    const fn = new Function(...Object.keys(sandbox), wrappedCode)(...Object.values(sandbox));
    
    // Execute with test case input
    const input = testCase.input;
    
    // Extract values from input object in a consistent order
    // This handles both { nums: [...], target: 9 } format and direct array format
    let values;
    if (Array.isArray(input)) {
      values = input;
    } else if (typeof input === 'object' && input !== null) {
      // Get values in consistent order (alphabetical by key for predictability)
      values = Object.keys(input).sort().map(key => input[key]);
    } else {
      values = [input];
    }
    
    // Call the solve function with input values
    const result = fn(...values);
    
    return {
      success: true,
      output: result,
    };
  } catch (error: any) {
    return {
      success: false,
      output: null,
      error: error.message,
    };
  }
};

// Helper function to execute Python code (simulated with validation)
const executePython = (code: string, testCase: any): { success: boolean; output: any; error?: string } => {
  try {
    // Check for solve function definition
    const solvePattern = /def\s+solve\s*\(/;
    if (!solvePattern.test(code)) {
      return {
        success: false,
        output: null,
        error: 'Python code must define a function named "solve". Example: def solve(nums, target):',
      };
    }

    // Basic syntax validation
    const lines = code.split('\n');
    let indentLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const stripped = line.trim();
      
      // Skip empty lines and comments
      if (!stripped || stripped.startsWith('#')) continue;
      
      // Check for basic syntax errors
      if (stripped.includes(':')) {
        // Should have indented block after
        if (i < lines.length - 1) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && !nextLine.startsWith('#') && !lines[i + 1].startsWith(' ')) {
            return {
              success: false,
              output: null,
              error: `Line ${i + 1}: Expected indented block after ':'`,
            };
          }
        }
      }
    }

    // For security, we don't actually execute Python code
    // Instead, we validate syntax and return a simulated success
    // In production, use a sandboxed environment like Docker or restricted Python
    return {
      success: true,
      output: null,
      error: undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      output: null,
      error: error.message,
    };
  }
};

// Helper function to validate Java code (syntax check only for now)
const validateJavaCode = (code: string): { valid: boolean; error?: string } => {
  // Basic syntax checks
  // Check for any class declaration (flexible class name)
  const classPattern = /class\s+\w+/;
  if (!classPattern.test(code)) {
    return { valid: false, error: 'Java code must contain a class declaration (e.g., class Solution, class Main, etc.)' };
  }
  // Check for public static method (common pattern)
  if (!code.includes('public static')) {
    return { valid: false, error: 'Java method should be declared as public static for easy testing' };
  }
  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    return { valid: false, error: 'Unbalanced braces in Java code' };
  }
  return { valid: true };
};

// Helper function to validate C code (syntax check only for now)
const validateCCode = (code: string): { valid: boolean; error?: string } => {
  // Basic syntax checks
  if (!code.includes('#include')) {
    return { valid: false, error: 'C code should include necessary headers' };
  }
  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    return { valid: false, error: 'Unbalanced braces in C code' };
  }
  // Check for semicolons (basic check)
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.endsWith('{') && !line.endsWith('}') && !line.endsWith(';') && 
        !line.startsWith('//') && !line.startsWith('#') && !line.startsWith('*') &&
        !line.endsWith('\\') && line !== '') {
      // This is a basic check and may have false positives
    }
  }
  return { valid: true };
};

// Helper function to compare outputs
// Helper function to deeply compare outputs with floating point tolerance
const compareOutputs = (actual: any, expected: any): boolean => {
  // Handle null/undefined
  if (actual === null || actual === undefined) {
    return expected === null || expected === undefined;
  }
  
  // Handle different types
  if (typeof actual !== typeof expected) {
    // Try to convert for comparison
    if (typeof actual === 'number' && typeof expected === 'string') {
      expected = parseFloat(expected);
    } else if (typeof actual === 'string' && typeof expected === 'number') {
      actual = parseFloat(actual);
    } else {
      return false;
    }
  }
  
  // Handle numbers with floating point tolerance
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 0.0001;
  }
  
  // Handle arrays
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return actual.every((val, idx) => compareOutputs(val, expected[idx]));
  }
  
  // Handle objects
  if (typeof actual === 'object' && typeof expected === 'object') {
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;
    return actualKeys.every(key => compareOutputs(actual[key], expected[key]));
  }
  
  // Handle primitives
  return actual === expected;
};

// @desc    Submit solution
// @route   POST /api/student/dsa/problems/:id/submit
// @access  Private/Student
export const submitSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body;
    
    // Validate request body
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Code is required and must be a string' });
      return;
    }
    
    const problem = await Problem.findById(req.params.id);
    const student = await Student.findOne({ userId: req.user?._id });

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found' });
      return;
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Execute code against all test cases
    const results = [];
    let allPassed = true;
    let firstError = null;
    let languageSupported = true;

    // Validate code based on language
    if (language === 'java') {
      const validation = validateJavaCode(code);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: `Java validation error: ${validation.error}`,
        });
        return;
      }
    } else if (language === 'c') {
      const validation = validateCCode(code);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: `C validation error: ${validation.error}`,
        });
        return;
      }
    }

    // Check if test cases exist
    if (!problem.testCases || problem.testCases.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No test cases available for this problem',
      });
      return;
    }

    for (const testCase of problem.testCases) {
      let executionResult;
      
      // Validate test case
      if (!testCase || !testCase.input) {
        results.push({
          input: null,
          expectedOutput: testCase?.expectedOutput,
          actualOutput: null,
          passed: false,
          isPublic: testCase?.isPublic ?? false,
          error: 'Invalid test case: missing input',
        });
        allPassed = false;
        continue;
      }
      
      if (language === 'javascript' || !language) {
        executionResult = executeJavaScript(code, testCase);
      } else if (language === 'python') {
        // For Python, validate syntax only (safe execution requires sandbox)
        executionResult = executePython(code, testCase);
        languageSupported = false; // Mark as not fully executable
      } else if (language === 'java' || language === 'c') {
        // For Java and C, we validate syntax but can't execute in this sandbox
        // Mark as passed for syntax validation
        executionResult = {
          success: true,
          output: null,
          error: undefined,
        };
        languageSupported = false;
      } else {
        executionResult = {
          success: false,
          output: null,
          error: `Language '${language}' is not supported for execution`,
        };
      }

      const passed = executionResult.success && (languageSupported ? compareOutputs(executionResult.output, testCase.expectedOutput) : true);
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: executionResult.output,
        passed: languageSupported ? passed : true, // If language not executable, mark as passed for syntax
        isPublic: testCase.isPublic,
        error: executionResult.error,
        note: !languageSupported ? `Code syntax validated. ${language} execution requires external compiler.` : undefined,
      });

      if (!passed && languageSupported) {
        allPassed = false;
        if (!firstError && executionResult.error) {
          firstError = executionResult.error;
        }
      }
    }
    
    // For Java/C, we consider it "passed" if syntax is valid
    if (!languageSupported) {
      allPassed = true;
    }

    // Initialize practice object if not exists
    if (!student.practice) {
      (student as any).practice = {
        dsa: {
          totalProblems: 0,
          solvedProblems: 0,
          accuracy: 0,
          companySpecific: new Map(),
          patternBased: new Map(),
          recentActivity: [],
        },
        aptitude: {
          totalTests: 0,
          completedTests: 0,
          averageScore: 0,
          companySpecific: new Map(),
          weakAreas: [],
          recentActivity: [],
        },
      };
    }

    // Initialize DSA if not exists
    if (!student.practice.dsa) {
      student.practice.dsa = {
        totalProblems: 0,
        solvedProblems: 0,
        accuracy: 0,
        companySpecific: new Map(),
        patternBased: new Map(),
        recentActivity: [],
      };
    }

    // Initialize DSA sub-objects if not exists
    if (!student.practice.dsa.companySpecific) {
      student.practice.dsa.companySpecific = new Map();
    }
    if (!student.practice.dsa.patternBased) {
      student.practice.dsa.patternBased = new Map();
    }
    if (!student.practice.dsa.recentActivity) {
      student.practice.dsa.recentActivity = [];
    }

    // Update student stats
    if (allPassed) {
      student.practice.dsa.solvedProblems = (student.practice.dsa.solvedProblems || 0) + 1;
      student.practice.dsa.totalProblems = (student.practice.dsa.totalProblems || 0) + 1;
      student.practice.dsa.recentActivity.push({
        problemId: problem._id.toString(),
        date: new Date(),
        status: 'solved',
      });

      // Update company-specific stats
      problem.companies.forEach((company) => {
        if (!student.practice.dsa.companySpecific.get(company)) {
          student.practice.dsa.companySpecific.set(company, {
            solved: 0,
            total: 0,
            accuracy: 0,
          });
        }
        const companyStats = student.practice.dsa.companySpecific.get(company)!;
        companyStats.solved = (companyStats.solved || 0) + 1;
        companyStats.total = (companyStats.total || 0) + 1;
        companyStats.accuracy = ((companyStats.solved || 0) / (companyStats.total || 1)) * 100;
      });

      // Update pattern-based stats
      if (!student.practice.dsa.patternBased.get(problem.pattern)) {
        student.practice.dsa.patternBased.set(problem.pattern, {
          solved: 0,
          total: 0,
          accuracy: 0,
        });
      }
      const patternStats = student.practice.dsa.patternBased.get(problem.pattern)!;
      patternStats.solved = (patternStats.solved || 0) + 1;
      patternStats.total = (patternStats.total || 0) + 1;
      patternStats.accuracy = ((patternStats.solved || 0) / (patternStats.total || 1)) * 100;

      // Update category stats
      if (!student.practice.dsa.categoryBased) {
        (student.practice.dsa as any).categoryBased = new Map();
      }
      if (!(student.practice.dsa as any).categoryBased.get(problem.category)) {
        (student.practice.dsa as any).categoryBased.set(problem.category, {
          solved: 0,
          total: 0,
          accuracy: 0,
        });
      }
      const categoryStats = (student.practice.dsa as any).categoryBased.get(problem.category)!;
      categoryStats.solved = (categoryStats.solved || 0) + 1;
      categoryStats.total = (categoryStats.total || 0) + 1;
      categoryStats.accuracy = ((categoryStats.solved || 0) / (categoryStats.total || 1)) * 100;

      student.practice.dsa.accuracy = ((student.practice.dsa.solvedProblems || 0) / (student.practice.dsa.totalProblems || 1)) * 100;
    } else {
      student.practice.dsa.totalProblems = (student.practice.dsa.totalProblems || 0) + 1;
      student.practice.dsa.recentActivity.push({
        problemId: problem._id.toString(),
        date: new Date(),
        status: 'attempted',
      });
      
      // Update company stats for attempted
      problem.companies.forEach((company) => {
        if (!student.practice.dsa.companySpecific.get(company)) {
          student.practice.dsa.companySpecific.set(company, {
            solved: 0,
            total: 0,
            accuracy: 0,
          });
        }
        const companyStats = student.practice.dsa.companySpecific.get(company)!;
        companyStats.total = (companyStats.total || 0) + 1;
        companyStats.accuracy = ((companyStats.solved || 0) / (companyStats.total || 1)) * 100;
      });

      student.practice.dsa.accuracy = ((student.practice.dsa.solvedProblems || 0) / (student.practice.dsa.totalProblems || 1)) * 100;
    }

    await student.save();

    // Update problem stats
    problem.submissions += 1;
    if (allPassed) {
      const acceptedSubmissions = Math.round((problem.acceptanceRate * problem.submissions) / 100) + 1;
      problem.acceptanceRate = (acceptedSubmissions / problem.submissions) * 100;
    }
    await problem.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect: allPassed,
        message: allPassed 
          ? languageSupported 
            ? 'Solution accepted! All test cases passed.' 
            : `Code syntax validated for ${language}. Note: Full execution testing requires external compiler.`
          : `Solution incorrect. ${firstError || 'Some test cases failed.'}`,
        results: results.filter(r => r.isPublic || allPassed), // Only show all results if passed
        passedCount: results.filter(r => r.passed).length,
        totalCount: results.length,
        languageSupported,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit solution',
    });
  }
};

// @desc    Get aptitude tests
// @route   GET /api/student/aptitude/tests
// @access  Private/Student
export const getAptitudeTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, company, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (company) filter.companies = company;

    const skip = (Number(page) - 1) * Number(limit);

    const tests = await AptitudeTest.find(filter)
      .select('-questions')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await AptitudeTest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get aptitude tests',
    });
  }
};

// @desc    Get aptitude test by ID
// @route   GET /api/student/aptitude/tests/:id
// @access  Private/Student
export const getAptitudeTestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await AptitudeTest.findById(req.params.id);

    if (!test) {
      res.status(404).json({ success: false, message: 'Aptitude test not found' });
      return;
    }

    // Don't send correct answers
    const testWithoutAnswers = {
      ...test.toObject(),
      questions: test.questions.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
    };

    res.status(200).json({
      success: true,
      data: testWithoutAnswers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get aptitude test',
    });
  }
};

// @desc    Submit aptitude test
// @route   POST /api/student/aptitude/tests/:id/submit
// @access  Private/Student
export const submitAptitudeTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body; // { questionId: answerIndex }
    
    // Validate request body
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, message: 'Answers object is required' });
      return;
    }
    
    const test = await AptitudeTest.findById(req.params.id);
    const student = await Student.findOne({ userId: req.user?._id });

    if (!test) {
      res.status(404).json({ success: false, message: 'Aptitude test not found' });
      return;
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }
    
    // Validate test has questions
    if (!test.questions || test.questions.length === 0) {
      res.status(400).json({ success: false, message: 'Test has no questions' });
      return;
    }

    // Calculate score
    let correct = 0;
    console.log('Received answers:', answers);
    console.log('Test questions:', test.questions.map(q => ({ id: q.questionId, correct: q.correctAnswer })));
    
    const results = test.questions.map((question, index) => {
      // Use questionId if available, otherwise use index
      const answerKey = question.questionId || index.toString();
      
      // Try to match by questionId/index
      let userAnswer = answers[answerKey];
      
      // Also try alternative keys
      if (userAnswer === undefined && question.questionId) {
        userAnswer = answers[question.questionId.toString()];
      }
      if (userAnswer === undefined) {
        userAnswer = answers[index.toString()];
      }
      if (userAnswer === undefined) {
        userAnswer = answers[index];
      }
      
      console.log(`Question ${index} (key: ${answerKey}): userAnswer=${userAnswer}, correct=${question.correctAnswer}`);
      
      // Handle both string and number comparisons
      const isCorrect = userAnswer !== undefined && 
                       userAnswer !== null && 
                       parseInt(userAnswer) === parseInt(question.correctAnswer as any);
      if (isCorrect) correct++;

      return {
        questionId: question.questionId || index.toString(),
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });
    
    console.log('Results:', results);
    console.log('Correct count:', correct);

    const score = (correct / test.totalQuestions) * 100;

    // Initialize practice object if not exists
    if (!student.practice) {
      (student as any).practice = {
        dsa: {
          totalProblems: 0,
          solvedProblems: 0,
          accuracy: 0,
          companySpecific: new Map(),
          patternBased: new Map(),
          recentActivity: [],
        },
        aptitude: {
          totalTests: 0,
          completedTests: 0,
          averageScore: 0,
          companySpecific: new Map(),
          weakAreas: [],
          recentActivity: [],
        },
      };
    }

    // Initialize aptitude if not exists
    if (!student.practice.aptitude) {
      student.practice.aptitude = {
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        companySpecific: new Map(),
        weakAreas: [],
        recentActivity: [],
      };
    }

    // Update student stats
    student.practice.aptitude.completedTests = (student.practice.aptitude.completedTests || 0) + 1;
    student.practice.aptitude.totalTests = (student.practice.aptitude.totalTests || 0) + 1;
    const currentAvg = student.practice.aptitude.averageScore || 0;
    const completedCount = student.practice.aptitude.completedTests;
    student.practice.aptitude.averageScore =
      ((currentAvg * (completedCount - 1)) + score) / completedCount;

    // Initialize recentActivity array if not exists
    if (!student.practice.aptitude.recentActivity) {
      student.practice.aptitude.recentActivity = [];
    }

    student.practice.aptitude.recentActivity.push({
      testId: test._id.toString(),
      date: new Date(),
      score: Math.round(score),
    });

    // Initialize companySpecific if not exists
    if (!student.practice.aptitude.companySpecific) {
      student.practice.aptitude.companySpecific = new Map();
    }

    // Update company-specific stats
    test.companies.forEach((company) => {
      if (!student.practice.aptitude.companySpecific.get(company)) {
        student.practice.aptitude.companySpecific.set(company, {
          completed: 0,
          averageScore: 0,
        });
      }
      const companyStats = student.practice.aptitude.companySpecific.get(company)!;
      companyStats.completed = (companyStats.completed || 0) + 1;
      const companyAvg = companyStats.averageScore || 0;
      companyStats.averageScore = ((companyAvg * (companyStats.completed - 1)) + score) / companyStats.completed;
    });

    // Identify weak areas
    const weakTopics = new Set<string>();
    results.forEach((result, index) => {
      if (!result.isCorrect) {
        weakTopics.add(test.questions[index].topic);
      }
    });
    
    // Initialize weakAreas if not exists
    if (!student.practice.aptitude.weakAreas) {
      student.practice.aptitude.weakAreas = [];
    }
    student.practice.aptitude.weakAreas = Array.from(weakTopics);

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        score: Math.round(score),
        correct,
        total: test.totalQuestions,
        passed: score >= test.passingScore,
        results,
        weakAreas: Array.from(weakTopics),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit aptitude test',
    });
  }
};

// @desc    Start mock interview
// @route   POST /api/student/interviews/start
// @access  Private/Student
export const startMockInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.body; // 'technical', 'hr', 'managerial'
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // TODO: Implement actual mock interview with AI
    // For now, return interview structure
    const interviewId = `interview-${Date.now()}`;

    res.status(200).json({
      success: true,
      data: {
        interviewId,
        type,
        status: 'started',
        message: 'Mock interview session created. Implementation pending.',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start mock interview',
    });
  }
};

// @desc    Get mock interview feedback
// @route   GET /api/student/interviews/:id/feedback
// @access  Private/Student
export const getMockInterviewFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });
    const interview = student?.interviews.find((i) => i.interviewId === req.params.id);

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get interview feedback',
    });
  }
};

// @desc    Analyze English
// @route   POST /api/student/english/analyze
// @access  Private/Student
export const analyzeEnglish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, audioUrl } = req.body;
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // TODO: Implement actual English analysis using NLP and AI
    // For now, return mock analysis
    const analysis = {
      overallScore: 75,
      grammar: 80,
      vocabulary: 70,
      pronunciation: 0, // Would require audio processing
      writing: 75,
      lastAnalyzed: new Date(),
      improvements: [
        'Work on expanding vocabulary',
        'Practice grammar rules',
        'Improve sentence structure',
      ],
    };

    student.english = analysis;
    await student.save();

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze English',
    });
  }
};

// @desc    Get core subjects
// @route   GET /api/student/core-subjects
// @access  Private/Student
export const getCoreSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const subjects = [
      'Data Structures',
      'Algorithms',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'Object-Oriented Programming',
      'Software Engineering',
      'System Design',
    ];

    const subjectsData = subjects.map((subject) => {
      const subjectData = student.coreSubjects.get(subject) || {
        score: 0,
        completedModules: 0,
        totalModules: 10,
        lastAccessed: null,
      };
      return {
        name: subject,
        ...subjectData,
      };
    });

    res.status(200).json({
      success: true,
      data: subjectsData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get core subjects',
    });
  }
};

// @desc    Get subject details
// @route   GET /api/student/core-subjects/:subject
// @access  Private/Student
export const getSubjectDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = decodeURIComponent(req.params.subject);
    // TODO: Implement subject details with modules, quizzes, etc.
    res.status(200).json({
      success: true,
      data: {
        subject,
        modules: [],
        message: 'Subject details implementation pending',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subject details',
    });
  }
};

// @desc    Update weekly goals
// @route   PUT /api/student/goals
// @access  Private/Student
export const updateWeeklyGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dsaProblems, aptitudeTests, studyHours } = req.body;
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    student.analytics.weeklyGoals = {
      dsaProblems: dsaProblems || student.analytics.weeklyGoals.dsaProblems,
      aptitudeTests: aptitudeTests || student.analytics.weeklyGoals.aptitudeTests,
      studyHours: studyHours || student.analytics.weeklyGoals.studyHours,
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: student.analytics.weeklyGoals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update goals',
    });
  }
};

// @desc    Get analytics
// @route   GET /api/student/analytics
// @access  Private/Student
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Ensure all nested objects exist with defaults
    const practice = student.practice || {
      dsa: { totalProblems: 0, solvedProblems: 0, accuracy: 0, companySpecific: new Map(), patternBased: new Map(), recentActivity: [] },
      aptitude: { totalTests: 0, completedTests: 0, averageScore: 0, companySpecific: new Map(), weakAreas: [], recentActivity: [] },
    };

    const dsa = practice.dsa || { totalProblems: 0, solvedProblems: 0, accuracy: 0, companySpecific: new Map(), patternBased: new Map(), recentActivity: [] };
    const aptitude = practice.aptitude || { totalTests: 0, completedTests: 0, averageScore: 0, companySpecific: new Map(), weakAreas: [], recentActivity: [] };
    
    const analytics = student.analytics || {
      dailyProgress: [],
      weeklyGoals: { dsaProblems: 10, aptitudeTests: 3, studyHours: 20 },
      achievements: [],
      testHistory: [],
    };

    const weeklyGoals = analytics.weeklyGoals || { dsaProblems: 10, aptitudeTests: 3, studyHours: 20 };

    res.status(200).json({
      success: true,
      data: {
        readiness: student.readiness || { overallScore: 0, technicalScore: 0, aptitudeScore: 0, communicationScore: 0 },
        practice: {
          dsa: {
            totalProblems: dsa.totalProblems || 0,
            solvedProblems: dsa.solvedProblems || 0,
            accuracy: dsa.accuracy || 0,
            companySpecific: dsa.companySpecific || new Map(),
            patternBased: dsa.patternBased || new Map(),
            recentActivity: dsa.recentActivity || [],
          },
          aptitude: {
            totalTests: aptitude.totalTests || 0,
            completedTests: aptitude.completedTests || 0,
            averageScore: aptitude.averageScore || 0,
            companySpecific: aptitude.companySpecific || new Map(),
            weakAreas: aptitude.weakAreas || [],
            recentActivity: aptitude.recentActivity || [],
          },
        },
        english: student.english,
        analytics: analytics,
        progress: {
          dsa: {
            solved: dsa.solvedProblems || 0,
            goal: weeklyGoals.dsaProblems || 10,
            percentage: Math.min(100, ((dsa.solvedProblems || 0) / (weeklyGoals.dsaProblems || 10)) * 100),
          },
          aptitude: {
            completed: aptitude.completedTests || 0,
            goal: weeklyGoals.aptitudeTests || 3,
            percentage: Math.min(100, ((aptitude.completedTests || 0) / (weeklyGoals.aptitudeTests || 3)) * 100),
          },
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get analytics',
    });
  }
};

// @desc    Get recommended projects
// @route   GET /api/student/recommendations/projects
// @access  Private/Student
export const getRecommendedProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Rule-based project recommendations (no external AI)
    const recommendedProjects: any[] = [
      {
        name: 'Placement Analytics Dashboard',
        description: 'Build a dashboard showing student placement metrics, company-wise stats, and practice progress.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        difficulty: 'intermediate',
        whyRelevant: 'Demonstrates full-stack skills and data visualization aligned with placement platforms.',
      },
      {
        name: 'Online Coding Practice Platform',
        description: 'Create a DSA practice platform with problem sets, submissions, leaderboards, and basic analytics.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        difficulty: 'advanced',
        whyRelevant: 'Matches expectations of product-based companies around algorithms and systems.',
      },
    ];

    res.status(200).json({
      success: true,
      data: recommendedProjects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recommended projects',
    });
  }
};

// @desc    Get recommended skills
// @route   GET /api/student/recommendations/skills
// @access  Private/Student
export const getRecommendedSkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Rule-based skill recommendations (no external AI)
    const recommendedSkills: any[] = [
      {
        name: 'System Design Fundamentals',
        type: 'technical',
        priority: 'high',
        reason: 'Important for backend and full-stack roles and common in product-based interviews.',
        resources: [],
      },
      {
        name: 'Behavioral Interviewing',
        type: 'soft',
        priority: 'medium',
        reason: 'Helps you perform better in HR and behavioral rounds with structured answers (STAR).',
        resources: [],
      },
    ];

    res.status(200).json({
      success: true,
      data: recommendedSkills,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recommended skills',
    });
  }
};

// @desc    Get questions for readiness test
// @route   GET /api/student/readiness/test
// @access  Private/Student
export const getReadinessTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch 10 questions from Aptitude tests (Quantitative/Logical)
    const aptitudeTests = await AptitudeTest.find({ 
      type: { $in: ['quantitative', 'logical', 'mixed'] } 
    }).limit(10);

    // Fetch 20 questions from Technical/Verbal tests (Technical fundamentals)
    const technicalTests = await AptitudeTest.find({ 
      type: { $in: ['technical', 'verbal', 'mixed'] } 
    }).limit(10);

    const allAptitudeQuestions: any[] = [];
    aptitudeTests.forEach(test => {
      const testObj = test.toObject();
      testObj.questions.forEach((q: any) => {
        allAptitudeQuestions.push({
          ...q,
          type: 'aptitude'
        });
      });
    });

    const allTechnicalQuestions: any[] = [];
    technicalTests.forEach(test => {
      const testObj = test.toObject();
      testObj.questions.forEach((q: any) => {
        allTechnicalQuestions.push({
          ...q,
          type: 'technical'
        });
      });
    });

    if (allAptitudeQuestions.length === 0 && allTechnicalQuestions.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'No questions available. TPO needs to upload tests first.' 
      });
      return;
    }

    // Randomly pick questions
    const pickRandom = (arr: any[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, arr.length));
    };

    const pickedAptitude = pickRandom(allAptitudeQuestions, 10);
    const pickedTechnical = pickRandom(allTechnicalQuestions, 10);
    const pickedCoding = pickRandom(allTechnicalQuestions.filter(q => !pickedTechnical.includes(q)), 10);

    // Combine and format
    const finalQuestions = [
      ...pickedAptitude,
      ...pickedTechnical,
      ...pickedCoding
    ].map((q, idx) => ({
      questionId: q.questionId || `q_${idx}`,
      question: q.question,
      options: q.options,
      type: q.type === 'aptitude' ? 'aptitude' : (idx < pickedAptitude.length + pickedTechnical.length ? 'technical' : 'coding'),
      topic: q.topic || 'General',
    }));

    res.status(200).json({
      success: true,
      data: finalQuestions,
      message: 'Readiness test questions generated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate readiness test',
    });
  }
};
