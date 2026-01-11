import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Import admin controller functions
import { getAllUsers, getUserById, updateUser, deleteUser, bulkDeleteUsers, getDashboardStats, uploadUsers } from '../controllers/admin.controller';

// Admin dashboard
router.get('/dashboard', getDashboardStats);

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post((req, res) => {
    res.status(501).json({ success: false, message: 'Direct user creation not allowed. Use CSV upload.' });
  });

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.delete('/users/bulk', bulkDeleteUsers);

// Bulk user upload route
router.post('/users/upload', uploadUsers);

export default router;
