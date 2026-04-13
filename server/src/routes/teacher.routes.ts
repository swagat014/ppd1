import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDashboard,
  getStudents,
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getGrades,
  updateGrade,
  getSchedule,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getAnalytics,
} from '../controllers/teacher.controller';

const router = express.Router();

router.use(protect);
router.use(authorize('teacher'));

// Dashboard
router.get('/dashboard', getDashboard);

// Students
router.get('/students', getStudents);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

// Grades
router.get('/grades', getGrades);
router.put('/grades/:id', updateGrade);

// Schedule
router.get('/schedule', getSchedule);
router.post('/schedule', createScheduleEvent);
router.put('/schedule/:id', updateScheduleEvent);
router.delete('/schedule/:id', deleteScheduleEvent);

// Resources
router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
