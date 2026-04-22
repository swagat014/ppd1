import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Import admin controller functions
import { getAllUsers, getUserById, updateUser, deleteUser, bulkDeleteUsers, getDashboardStats, uploadUsers, createUser, getAllDepartments, createDepartment, updateDepartment, deleteDepartment, getPlacementStats, getSystemSettings, updateSystemSettings, getStudentAnalytics } from '../controllers/admin.controller';

// Import TPO controller functions for content management
import {
  createDSAProblem,
  updateDSAProblem,
  deleteDSAProblem,
  getDSAProblems,
  createAptitudeTest,
  updateAptitudeTest,
  deleteAptitudeTest,
  getAptitudeTests,
} from '../controllers/tpo.controller';

// Admin dashboard
router.get('/dashboard', getDashboardStats);
router.get('/dashboard/stats', getDashboardStats);
router.get('/placement-stats', getPlacementStats);
router.get('/analytics', getStudentAnalytics);

// Settings routes
router.route('/settings')
  .get(getSystemSettings)
  .put(updateSystemSettings);

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

// Specific bulk delete route needs to come before the parameterized route
router.delete('/users/bulk', bulkDeleteUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Bulk user upload route
router.post('/users/upload', uploadUsers);

// Department management routes
router.route('/departments')
  .get(getAllDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

// DSA Problems management (Admin can also manage)
router.get('/dsa/problems', getDSAProblems);
router.post('/dsa/problems', createDSAProblem);
router.put('/dsa/problems/:id', updateDSAProblem);
router.delete('/dsa/problems/:id', deleteDSAProblem);

// Aptitude Tests management (Admin can also manage)
router.get('/aptitude/tests', getAptitudeTests);
router.post('/aptitude/tests', createAptitudeTest);
router.put('/aptitude/tests/:id', updateAptitudeTest);
router.delete('/aptitude/tests/:id', deleteAptitudeTest);

export default router;
