import { Response } from 'express';
import Student from '../models/Student.model';
import Problem from '../models/Problem.model';
import AptitudeTest from '../models/AptitudeTest.model';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai: OpenAI | null = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — AI features are disabled.');
}

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

    res.status(200).json({
      success: true,
      data: {
        profile: student.userId,
        resume: student.resume,
        readiness: student.readiness,
        practice: {
          dsa: {
            solved: student.practice.dsa.solvedProblems,
            total: student.practice.dsa.totalProblems,
            accuracy: student.practice.dsa.accuracy,
          },
          aptitude: {
            completed: student.practice.aptitude.completedTests,
            averageScore: student.practice.aptitude.averageScore,
          },
        },
        english: student.english,
        recentActivity: {
          dsa: student.practice.dsa.recentActivity.slice(0, 5),
          aptitude: student.practice.aptitude.recentActivity.slice(0, 5),
          interviews: student.interviews.slice(0, 3),
        },
        analytics: student.analytics,
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
    const student = await Student.findOne({ userId: req.user?._id });

    if (!student || !student.resume.fileUrl) {
      res.status(404).json({ success: false, message: 'Resume not found. Please upload a resume first.' });
      return;
    }

    // Read PDF file
    const filePath = path.join(process.cwd(), student.resume.fileUrl);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // Analyze with OpenAI
    const analysisPrompt = `Analyze the following resume for ATS (Applicant Tracking System) compatibility and provide:
1. ATS-friendly score (0-100)
2. Important keywords found
3. Missing keywords that should be included
4. Specific suggestions for improvement
5. Readability score (0-100)

Resume text:
${resumeText}

Provide the response in JSON format with the following structure:
{
  "atsScore": number,
  "keywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "readabilityScore": number
}`;

    if (!openai) {
      res.status(503).json({ success: false, message: 'OpenAI API key not configured. Resume analysis is unavailable.' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Update student resume analysis
    student.resume.atsScore = analysis.atsScore || 0;
    student.resume.analysis = {
      keywords: analysis.keywords || [],
      missingKeywords: analysis.missingKeywords || [],
      suggestions: analysis.suggestions || [],
      readabilityScore: analysis.readabilityScore || 0,
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        atsScore: student.resume.atsScore,
        analysis: student.resume.analysis,
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

    // Generate recommendations
    const recommendations: string[] = [];
    if (technicalScore < 60) recommendations.push('Focus on solving more DSA problems. Aim for at least 100 solved problems.');
    if (aptitudeScore < 60) recommendations.push('Practice more aptitude tests to improve your quantitative and logical reasoning skills.');
    if (communicationScore < 60) recommendations.push('Work on improving your English communication skills through practice and mock interviews.');
    if (projectsScore < 60) recommendations.push('Build more projects to showcase your technical skills and experience.');
    if (skillsScore < 60) recommendations.push('Learn new technologies and frameworks relevant to your target companies.');

    // Use AI for detailed recommendations
    const prompt = `Based on the following student data, provide detailed recommendations for placement preparation:
- Technical Score: ${technicalScore}
- Aptitude Score: ${aptitudeScore}
- Communication Score: ${communicationScore}
- Projects: ${student.projects.length}
- Skills: ${student.skills.technical.length} technical, ${student.skills.soft.length} soft

Provide 5-7 specific, actionable recommendations in JSON format:
{
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    let aiRecommendations: string[] = [];
    try {
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
        aiRecommendations = aiResponse.recommendations || [];
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    }

    student.readiness = {
      overallScore: Math.round(overallScore),
      technicalScore: Math.round(technicalScore),
      aptitudeScore: Math.round(aptitudeScore),
      communicationScore: Math.round(communicationScore),
      projectsScore: Math.round(projectsScore),
      skillsScore: Math.round(skillsScore),
      lastAnalyzed: new Date(),
      recommendations: [...recommendations, ...aiRecommendations].slice(0, 10),
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

// @desc    Submit solution
// @route   POST /api/student/dsa/problems/:id/submit
// @access  Private/Student
export const submitSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body;
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

    // TODO: Execute code against test cases (implement code execution service)
    // For now, simulate execution
    const isCorrect = Math.random() > 0.3; // Placeholder logic

    if (isCorrect) {
      student.practice.dsa.solvedProblems += 1;
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
        companyStats.solved += 1;
        companyStats.total += 1;
        companyStats.accuracy = (companyStats.solved / companyStats.total) * 100;
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
      patternStats.solved += 1;
      patternStats.total += 1;
      patternStats.accuracy = (patternStats.solved / patternStats.total) * 100;

      student.practice.dsa.accuracy = (student.practice.dsa.solvedProblems / student.practice.dsa.totalProblems) * 100;
    } else {
      student.practice.dsa.recentActivity.push({
        problemId: problem._id.toString(),
        date: new Date(),
        status: 'attempted',
      });
    }

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        message: isCorrect ? 'Solution accepted!' : 'Solution incorrect. Try again!',
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

    // Calculate score
    let correct = 0;
    const results = test.questions.map((question) => {
      const userAnswer = answers[question.questionId];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correct++;

      return {
        questionId: question.questionId,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = (correct / test.totalQuestions) * 100;

    // Update student stats
    student.practice.aptitude.completedTests += 1;
    student.practice.aptitude.totalTests += 1;
    student.practice.aptitude.averageScore =
      ((student.practice.aptitude.averageScore * (student.practice.aptitude.completedTests - 1)) + score) /
      student.practice.aptitude.completedTests;

    student.practice.aptitude.recentActivity.push({
      testId: test._id.toString(),
      date: new Date(),
      score: Math.round(score),
    });

    // Update company-specific stats
    test.companies.forEach((company) => {
      if (!student.practice.aptitude.companySpecific.get(company)) {
        student.practice.aptitude.companySpecific.set(company, {
          completed: 0,
          averageScore: 0,
        });
      }
      const companyStats = student.practice.aptitude.companySpecific.get(company)!;
      companyStats.completed += 1;
      companyStats.averageScore = ((companyStats.averageScore * (companyStats.completed - 1)) + score) / companyStats.completed;
    });

    // Identify weak areas
    const weakTopics = new Set<string>();
    results.forEach((result, index) => {
      if (!result.isCorrect) {
        weakTopics.add(test.questions[index].topic);
      }
    });
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

    res.status(200).json({
      success: true,
      data: {
        readiness: student.readiness,
        practice: student.practice,
        english: student.english,
        analytics: student.analytics,
        progress: {
          dsa: {
            solved: student.practice.dsa.solvedProblems,
            goal: student.analytics.weeklyGoals.dsaProblems,
            percentage: Math.min(100, (student.practice.dsa.solvedProblems / student.analytics.weeklyGoals.dsaProblems) * 100),
          },
          aptitude: {
            completed: student.practice.aptitude.completedTests,
            goal: student.analytics.weeklyGoals.aptitudeTests,
            percentage: Math.min(100, (student.practice.aptitude.completedTests / student.analytics.weeklyGoals.aptitudeTests) * 100),
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

    // Generate project recommendations based on student profile
    const prompt = `Based on the following student profile, suggest 5 relevant projects:
- Current Skills: ${student.skills.technical.join(', ')}
- Current Projects: ${student.projects.map((p) => p.name).join(', ')}
- Readiness Score: ${student.readiness.overallScore}

Provide project suggestions in JSON format:
{
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "difficulty": "beginner|intermediate|advanced",
      "whyRelevant": "Why this project is relevant"
    }
  ]
}`;

    let recommendedProjects: any[] = [];
    try {
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        const response = JSON.parse(completion.choices[0].message.content || '{}');
        recommendedProjects = response.projects || [];
      } else {
        // Fallback recommendations when OpenAI is not configured
        recommendedProjects = [
          {
            name: 'E-Commerce Platform',
            description: 'Build a full-stack e-commerce application',
            technologies: ['React', 'Node.js', 'MongoDB'],
            difficulty: 'intermediate',
            whyRelevant: 'Shows full-stack development skills',
          },
        ];
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
      // Fallback recommendations
      recommendedProjects = [
        {
          name: 'E-Commerce Platform',
          description: 'Build a full-stack e-commerce application',
          technologies: ['React', 'Node.js', 'MongoDB'],
          difficulty: 'intermediate',
          whyRelevant: 'Shows full-stack development skills',
        },
      ];
    }

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

    // Generate skill recommendations
    const prompt = `Based on the following student profile, suggest 5-7 skills they should learn:
- Current Technical Skills: ${student.skills.technical.join(', ')}
- Current Soft Skills: ${student.skills.soft.join(', ')}
- Readiness Score: ${student.readiness.overallScore}
- Career Goals: Software Development

Provide skill suggestions in JSON format:
{
  "skills": [
    {
      "name": "Skill Name",
      "type": "technical|soft",
      "priority": "high|medium|low",
      "reason": "Why this skill is important",
      "resources": ["resource1", "resource2"]
    }
  ]
}`;

    let recommendedSkills: any[] = [];
    try {
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        const response = JSON.parse(completion.choices[0].message.content || '{}');
        recommendedSkills = response.skills || [];
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    }

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
