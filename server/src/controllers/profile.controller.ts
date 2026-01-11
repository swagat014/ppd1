import { Request, Response } from 'express';
import Profile from '../models/Profile.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne({ userId: req.user!.id }).populate('userId', '-password');
    
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
export const createOrUpdateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, ...profileData } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ userId: req.user!.id });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.user!.id },
        { $set: { ...profileData } },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await Profile.create({
        userId: req.user!.id,
        role: user.role,
        ...profileData
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: profile ? 'Profile updated successfully' : 'Profile created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update student academic info
// @route   PUT /api/profile/academic
// @access  Private (Students only)
export const updateAcademicInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { semesterRecords, currentSemester, year } = req.body;
    
    // Calculate CGPA based on all semester SGPA values
    let totalPoints = 0;
    let totalSemesters = 0;
    
    if (semesterRecords && Array.isArray(semesterRecords)) {
      semesterRecords.forEach((record: any) => {
        if (record.sgpa !== undefined && record.sgpa !== null) {
          totalPoints += record.sgpa;
          totalSemesters++;
        }
      });
    }
    
    const cgpa = totalSemesters > 0 ? parseFloat((totalPoints / totalSemesters).toFixed(2)) : 0;
    
    // Find existing profile
    let profile = await Profile.findOne({ userId: req.user!.id });
    
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
      return;
    }
    
    // Update academic info
    if (profile.studentInfo) {
      profile.studentInfo.academicInfo = {
        semesterRecords: semesterRecords || profile.studentInfo.academicInfo?.semesterRecords || [],
        cgpa,
        backlogs: profile.studentInfo.academicInfo?.backlogs || [],
        currentSemester: currentSemester || profile.studentInfo.academicInfo?.currentSemester || 1,
        year: year || profile.studentInfo.academicInfo?.year || 1
      };
    } else {
      profile.studentInfo = {
        academicInfo: {
          semesterRecords: semesterRecords || [],
          cgpa,
          backlogs: [],
          currentSemester: currentSemester || 1,
          year: year || 1
        },
        registrationNo: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        department: ''
      };
    }
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      data: profile,
      message: 'Academic information updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update admin college name
// @route   PUT /api/profile/college
// @access  Private (Admin only)
export const updateCollegeName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { collegeName } = req.body;
    
    // Find existing profile
    let profile = await Profile.findOne({ userId: req.user!.id });
    
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
      return;
    }
    
    // Only allow admin to update college name
    if (req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admin can update college name'
      });
      return;
    }
    
    // Update college name
    if (!profile.adminInfo) {
      profile.adminInfo = {
        collegeName: collegeName || 'GCEK Buxar',
        phone: '',
        email: '',
        dateOfBirth: ''
      };
    } else {
      profile.adminInfo.collegeName = collegeName || profile.adminInfo.collegeName;
    }
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      data: profile,
      message: 'College name updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};