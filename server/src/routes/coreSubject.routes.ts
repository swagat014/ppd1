import express from 'express';
import { protect } from '../middleware/auth.middleware';
import * as coreSubjectController from '../controllers/coreSubject.controller';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/core-subjects');
    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Public routes (require authentication)
router.get('/department/:department', protect, coreSubjectController.getNotesByDepartment);
router.get('/department/:department/subject/:subject', protect, coreSubjectController.getNotesBySubject);
router.get('/department/:department/subjects', protect, coreSubjectController.getSubjectsByDepartment);
router.get('/department/:department/semester/:semester', protect, coreSubjectController.getNotesBySemester);
router.get('/:id/download', protect, coreSubjectController.downloadNote);

// Teacher routes (require authentication and teacher role)
router.post('/upload', protect, upload.single('file'), coreSubjectController.uploadNote);
router.put('/:id', protect, coreSubjectController.updateNote);
router.delete('/:id', protect, coreSubjectController.deleteNote);

export default router;