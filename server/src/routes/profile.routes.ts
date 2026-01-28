import express from 'express';
import { 
  getProfile, 
  createOrUpdateProfile, 
  updateAcademicInfo, 
  updateCollegeName,
  uploadProfilePicture
} from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getProfile);
router.post('/', protect, createOrUpdateProfile);
router.put('/academic', protect, updateAcademicInfo);
router.put('/college', protect, updateCollegeName);
router.post('/upload-picture', protect, uploadProfilePicture);

export default router;