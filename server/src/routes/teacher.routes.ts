import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('teacher'));

// TODO: Implement Teacher routes
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Teacher Dashboard - Implementation pending' });
});

router.get('/students', (req, res) => {
  res.json({ success: true, message: 'Get assigned students - Implementation pending' });
});

export default router;
