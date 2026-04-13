import express from 'express';
import { 
  getProfile, 
  createOrUpdateProfile, 
  updateAcademicInfo, 
  updateCollegeName,
  uploadProfilePicture
} from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import Department from '../models/Department.model';

const router = express.Router();

router.get('/', protect, getProfile);
router.post('/', protect, createOrUpdateProfile);
router.put('/academic', protect, updateAcademicInfo);
router.put('/college', protect, updateCollegeName);
router.post('/upload-picture', protect, uploadProfilePicture);

// @desc    Get all active departments (public endpoint for all authenticated users)
// @route   GET /api/profile/departments
// @access  Private
router.get('/departments', protect, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @desc    Get public system settings (for all authenticated users)
// @route   GET /api/profile/settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
  try {
    // Return public settings (non-sensitive)
    res.status(200).json({
      success: true,
      data: {
        siteName: 'Placement Portal',
        contactEmail: 'support@college.edu',
        contactPhone: '+91 1234567890',
        address: 'College Campus',
        maintenanceMode: false,
        allowRegistration: true,
        logoUrl: '',
        appearance: {
          primaryColor: '#00ff64',
          darkMode: true
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;