import express from 'express';
import {
  getDashboard,
  uploadResume,
  analyzeResume,
  getReadiness,
  analyzeReadiness,
  getDSAProblems,
  getProblemById,
  submitSolution,
  getAptitudeTests,
  getAptitudeTestById,
  submitAptitudeTest,
  startMockInterview,
  getMockInterviewFeedback,
  analyzeEnglish,
  getCoreSubjects,
  getSubjectDetails,
  updateWeeklyGoals,
  getAnalytics,
  getRecommendedProjects,
  getRecommendedSkills,
} from '../controllers/student.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

// Dashboard
router.get('/dashboard', getDashboard);

// Resume
router.post('/resume/upload', uploadResume);
router.post('/resume/analyze', analyzeResume);

// Readiness
router.get('/readiness', getReadiness);
router.post('/readiness/analyze', analyzeReadiness);

// DSA Practice
router.get('/dsa/problems', getDSAProblems);
router.get('/dsa/problems/:id', getProblemById);
router.post('/dsa/problems/:id/submit', submitSolution);

// Aptitude Practice
router.get('/aptitude/tests', getAptitudeTests);
router.get('/aptitude/tests/:id', getAptitudeTestById);
router.post('/aptitude/tests/:id/submit', submitAptitudeTest);

// Mock Interviews
router.post('/interviews/start', startMockInterview);
router.get('/interviews/:id/feedback', getMockInterviewFeedback);

// English Analysis
router.post('/english/analyze', analyzeEnglish);

// Core Subjects
router.get('/core-subjects', getCoreSubjects);
router.get('/core-subjects/:subject', getSubjectDetails);

// Analytics & Recommendations
router.get('/analytics', getAnalytics);
router.put('/goals', updateWeeklyGoals);
router.get('/recommendations/projects', getRecommendedProjects);
router.get('/recommendations/skills', getRecommendedSkills);

export default router;
