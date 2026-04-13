import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDashboard,
  getStudents,
  getAnalytics,
  createDSAProblem,
  updateDSAProblem,
  deleteDSAProblem,
  getDSAProblems,
  createAptitudeTest,
  updateAptitudeTest,
  deleteAptitudeTest,
  getAptitudeTests,
} from '../controllers/tpo.controller';

const router = express.Router();

router.use(protect);
router.use(authorize('tpo'));

// Dashboard
router.get('/dashboard', getDashboard);

// Students
router.get('/students', getStudents);

// Analytics
router.get('/analytics', getAnalytics);

// DSA Problems
router.get('/dsa/problems', getDSAProblems);
router.post('/dsa/problems', createDSAProblem);
router.put('/dsa/problems/:id', updateDSAProblem);
router.delete('/dsa/problems/:id', deleteDSAProblem);

// Aptitude Tests
router.get('/aptitude/tests', getAptitudeTests);
router.post('/aptitude/tests', createAptitudeTest);
router.put('/aptitude/tests/:id', updateAptitudeTest);
router.delete('/aptitude/tests/:id', deleteAptitudeTest);

export default router;
