import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Problem from '../models/Problem.model';
import AptitudeTest from '../models/AptitudeTest.model';
import Student from '../models/Student.model';
import User from '../models/User.model';

// @desc    Get TPO Dashboard stats
// @route   GET /api/tpo/dashboard
// @access  Private/TPO
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalTests = await AptitudeTest.countDocuments();
    
    // Get recent student activity with full readiness data
    const recentStudents = await Student.find()
      .populate('userId', 'profile.firstName profile.lastName email profile.department')
      .select('readiness practice analytics updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get students with readiness scores
    const studentsWithReadiness = await Student.find({
      'readiness.overallScore': { $gt: 0 }
    }).select('readiness.overallScore');

    const avgReadiness = studentsWithReadiness.length > 0
      ? studentsWithReadiness.reduce((sum, s) => sum + (s.readiness?.overallScore || 0), 0) / studentsWithReadiness.length
      : 0;

    // Get DSA stats
    const dsaStats = await Problem.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: '$submissions' },
          avgAcceptanceRate: { $avg: '$acceptanceRate' },
        },
      },
    ]);

    // Get Aptitude stats
    const aptitudeStats = await AptitudeTest.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: '$attempts' },
          avgScore: { $avg: '$averageScore' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalProblems,
          totalTests,
          avgReadiness: Math.round(avgReadiness),
          totalDsaSubmissions: dsaStats[0]?.totalSubmissions || 0,
          avgDsaAcceptance: Math.round(dsaStats[0]?.avgAcceptanceRate || 0),
          totalAptitudeAttempts: aptitudeStats[0]?.totalAttempts || 0,
          avgAptitudeScore: Math.round(aptitudeStats[0]?.avgScore || 0),
        },
        recentStudents: recentStudents.map(s => ({
          _id: s._id,
          userId: s.userId,
          readiness: s.readiness,
          practice: s.practice,
          updatedAt: s.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard',
    });
  }
};

// @desc    Get all students with their progress
// @route   GET /api/tpo/students
// @access  Private/TPO
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await Student.find()
      .populate('userId', 'profile.firstName profile.lastName email profile.department')
      .select('readiness practice analytics createdAt updatedAt')
      .sort({ updatedAt: -1 });

    // Transform data to ensure all fields are present
    const transformedStudents = students.map(student => {
      const s = student.toObject();
      
      // Helper to safely get nested values with defaults
      const getReadiness = (r: any) => ({
        overallScore: r?.overallScore ?? 0,
        technicalScore: r?.technicalScore ?? 0,
        aptitudeScore: r?.aptitudeScore ?? 0,
        communicationScore: r?.communicationScore ?? 0,
        projectsScore: r?.projectsScore ?? 0,
        skillsScore: r?.skillsScore ?? 0,
      });
      
      const getDsa = (d: any) => ({
        totalProblems: d?.totalProblems ?? 0,
        solvedProblems: d?.solvedProblems ?? 0,
        accuracy: d?.accuracy ?? 0,
        companySpecific: d?.companySpecific ?? {},
        patternBased: d?.patternBased ?? {},
        recentActivity: d?.recentActivity ?? [],
      });
      
      const getAptitude = (a: any) => ({
        totalTests: a?.totalTests ?? 0,
        completedTests: a?.completedTests ?? 0,
        averageScore: a?.averageScore ?? 0,
        companySpecific: a?.companySpecific ?? {},
        weakAreas: a?.weakAreas ?? [],
        recentActivity: a?.recentActivity ?? [],
      });
      
      const getAnalytics = (a: any) => ({
        achievements: a?.achievements ?? [],
        dailyProgress: a?.dailyProgress ?? [],
        weeklyGoals: a?.weeklyGoals ?? {},
        testHistory: a?.testHistory ?? [],
      });
      
      return {
        _id: s._id,
        userId: s.userId,
        fathers_name: s.fathers_name,
        phone: s.phone,
        date_of_birth: s.date_of_birth,
        resume: s.resume,
        readiness: getReadiness(s.readiness),
        practice: {
          dsa: getDsa(s.practice?.dsa),
          aptitude: getAptitude(s.practice?.aptitude),
        },
        analytics: getAnalytics(s.analytics),
        interviews: s.interviews ?? [],
        english: s.english,
        coreSubjects: s.coreSubjects ?? {},
        projects: s.projects ?? [],
        skills: s.skills,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: transformedStudents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get students',
    });
  }
};

// @desc    Create new DSA Problem
// @route   POST /api/tpo/dsa/problems
// @access  Private/TPO
export const createDSAProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      pattern,
      companies,
      tags,
      testCases,
      constraints,
      examples,
      hints,
      solution,
    } = req.body;

    // Validate required fields
    if (!title || !description || !difficulty || !category || !testCases) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, difficulty, category, testCases',
      });
      return;
    }

    // Check if problem already exists
    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
      res.status(400).json({
        success: false,
        message: 'Problem with this title already exists',
      });
      return;
    }

    const problem = await Problem.create({
      title,
      description,
      difficulty,
      category,
      pattern: pattern || category,
      companies: companies || [],
      tags: tags || [],
      testCases,
      constraints: constraints || '',
      examples: examples || [],
      hints: hints || [],
      solution: solution || {},
      submissions: 0,
      acceptanceRate: 0,
    });

    res.status(201).json({
      success: true,
      data: problem,
      message: 'Problem created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create problem',
    });
  }
};

// @desc    Update DSA Problem
// @route   PUT /api/tpo/dsa/problems/:id
// @access  Private/TPO
export const updateDSAProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: problem,
      message: 'Problem updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update problem',
    });
  }
};

// @desc    Delete DSA Problem
// @route   DELETE /api/tpo/dsa/problems/:id
// @access  Private/TPO
export const deleteDSAProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete problem',
    });
  }
};

// @desc    Get all DSA Problems (TPO view)
// @route   GET /api/tpo/dsa/problems
// @access  Private/TPO
export const getDSAProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: problems,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get problems',
    });
  }
};

// @desc    Create new Aptitude Test
// @route   POST /api/tpo/aptitude/tests
// @access  Private/TPO
export const createAptitudeTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      duration,
      companies,
      questions,
    } = req.body;

    // Validate required fields
    if (!title || !type || !duration || !questions || !Array.isArray(questions)) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, type, duration, questions',
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.correctAnswer === undefined) {
        res.status(400).json({
          success: false,
          message: `Question ${i + 1} is missing required fields (question, options, correctAnswer)`,
        });
        return;
      }
    }

    const test = await AptitudeTest.create({
      title,
      description,
      type,
      duration,
      companies: companies || [],
      questions,
      totalQuestions: questions.length,
      passingScore: 60,
      attempts: 0,
      averageScore: 0,
    });

    res.status(201).json({
      success: true,
      data: test,
      message: 'Aptitude test created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create aptitude test',
    });
  }
};

// @desc    Update Aptitude Test
// @route   PUT /api/tpo/aptitude/tests/:id
// @access  Private/TPO
export const updateAptitudeTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await AptitudeTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      res.status(404).json({ success: false, message: 'Test not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: test,
      message: 'Test updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update test',
    });
  }
};

// @desc    Delete Aptitude Test
// @route   DELETE /api/tpo/aptitude/tests/:id
// @access  Private/TPO
export const deleteAptitudeTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await AptitudeTest.findByIdAndDelete(req.params.id);

    if (!test) {
      res.status(404).json({ success: false, message: 'Test not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete test',
    });
  }
};

// @desc    Get all Aptitude Tests (TPO view)
// @route   GET /api/tpo/aptitude/tests
// @access  Private/TPO
export const getAptitudeTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tests = await AptitudeTest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tests',
    });
  }
};

// @desc    Get analytics for all students
// @route   GET /api/tpo/analytics
// @access  Private/TPO
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get DSA stats
    const dsaStats = await Problem.aggregate([
      {
        $group: {
          _id: null,
          totalProblems: { $sum: 1 },
          totalSubmissions: { $sum: '$submissions' },
          avgAcceptanceRate: { $avg: '$acceptanceRate' },
        },
      },
    ]);

    // Get Aptitude stats
    const aptitudeStats = await AptitudeTest.aggregate([
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          totalAttempts: { $sum: '$attempts' },
          avgScore: { $avg: '$averageScore' },
        },
      },
    ]);

    // Get student progress stats
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          avgReadinessScore: { $avg: '$readiness.overallScore' },
          totalStudents: { $sum: 1 },
        },
      },
    ]);

    // Get company-wise content distribution
    const companyDsaStats = await Problem.aggregate([
      { $unwind: '$companies' },
      {
        $group: {
          _id: '$companies',
          problemCount: { $sum: 1 },
        },
      },
    ]);

    const companyAptitudeStats = await AptitudeTest.aggregate([
      { $unwind: '$companies' },
      {
        $group: {
          _id: '$companies',
          testCount: { $sum: 1 },
        },
      },
    ]);

    // Get difficulty distribution
    const difficultyStats = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get category distribution
    const categoryStats = await Problem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dsa: {
          ...(dsaStats[0] || { totalProblems: 0, totalSubmissions: 0, avgAcceptanceRate: 0 }),
          byDifficulty: difficultyStats,
          byCategory: categoryStats,
          byCompany: companyDsaStats,
        },
        aptitude: {
          ...(aptitudeStats[0] || { totalTests: 0, totalAttempts: 0, avgScore: 0 }),
          byCompany: companyAptitudeStats,
        },
        students: {
          ...(studentStats[0] || { avgReadinessScore: 0, totalStudents: 0 }),
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
