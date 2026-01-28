import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Profile from '../models/Profile.model';
import User from '../models/User.model';
import Student from '../models/Student.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-pics';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadProfilePic = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed')); 
    }
  },
}).single('profilePic');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let profile = await Profile.findOne({ userId: req.user!._id }).populate('userId', '-password');
    
    // If profile doesn't exist, create a basic one based on user info
    if (!profile) {
      const user = await User.findById(req.user!._id).select('-password');
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      // Create a basic profile based on user role
      const profileData: any = {
        userId: user._id,
        role: user.role,
      };
      
      if (user.role === 'student') {
        profileData.studentInfo = {
          registrationNo: '',
          phone: user.profile.phone || '',
          email: user.email,
          dateOfBirth: user.profile.dateOfBirth || '',
          department: user.profile.department || '',
          academicInfo: {
            semesterRecords: [],
            cgpa: 0,
            backlogs: [],
            currentSemester: 1,
            year: 1
          }
        };
      } else if (user.role === 'teacher' || user.role === 'tpo') {
        profileData.employeeInfo = {
          employeeId: '',
          phone: user.profile.phone || '',
          email: user.email,
          dateOfBirth: user.profile.dateOfBirth || '',
          department: user.profile.department || ''
        };
      } else if (user.role === 'admin') {
        profileData.adminInfo = {
          collegeName: 'GCEK Buxar',
          phone: user.profile.phone || '',
          email: user.email,
          dateOfBirth: user.profile.dateOfBirth || ''
        };
      }
      
      profile = await Profile.create(profileData);
    }
    
    // For students, enrich the profile with data from Student model
    if (profile.role === 'student') {
      const student = await Student.findOne({ userId: req.user!._id });
      if (student) {
        // Ensure studentInfo exists
        if (!profile.studentInfo) {
          profile.studentInfo = {
            registrationNo: '',
            phone: '',
            email: '',
            dateOfBirth: '',
            department: '',
            academicInfo: {
              semesterRecords: [],
              cgpa: 0,
              backlogs: [],
              currentSemester: 1,
              year: 1
            }
          };
        }
        // Store original department to preserve it
        const originalDepartment = profile.studentInfo.department;
        // Update profile with student-specific data
        profile.studentInfo.fatherName = student.fathers_name;
        profile.studentInfo.dateOfBirth = student.date_of_birth;
        profile.studentInfo.phone = student.phone || profile.studentInfo.phone;
        // Preserve department from user profile
        profile.studentInfo.department = originalDepartment;
      }
    }
    
    // Populate user data
    await profile.populate('userId', '-password');
    
    // Restructure response to match frontend expectations
    const profileObj = profile.toObject();
    
    // Create response data with proper field mapping for frontend
    const responseData = {
      ...profileObj,
      // For students, map field names to match frontend expectations
      ...(profileObj.role === 'student' && profileObj.studentInfo ? {
        studentInfo: {
          ...profileObj.studentInfo,
          fathers_name: profileObj.studentInfo.fatherName, // Map fatherName to fathers_name
          date_of_birth: profileObj.studentInfo.dateOfBirth, // Map dateOfBirth to date_of_birth
        }
      } : {}),

      user: profileObj.userId  // Move populated user data to 'user' field
    };
    
    // Remove the userId field to avoid duplication
    const { userId, ...finalResponse } = responseData;
    
    res.status(200).json({
      success: true,
      data: finalResponse
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
    let profile = await Profile.findOne({ userId: req.user!._id });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.user!._id },
        { $set: { ...profileData } },
        { new: true, runValidators: true }
      ).populate('userId', '-password');
    } else {
      // Create new profile
      profile = await Profile.create({
        userId: req.user!._id,
        role: user.role,
        ...profileData
      });
      
      // Populate the newly created profile
      await profile.populate('userId', '-password');
    }

    if (profile) {
      // Synchronize department from user profile to profile model
      if (user.profile.department && profile.role === 'student' && profile.studentInfo) {
        profile.studentInfo.department = user.profile.department;
      } else if (user.profile.department && (profile.role === 'teacher' || profile.role === 'tpo') && profile.employeeInfo) {
        profile.employeeInfo.department = user.profile.department;
      }
      
      // For students, enrich the profile with data from Student model
      if (profile.role === 'student') {
        const student = await Student.findOne({ userId: req.user!._id });
        if (student) {
          // Ensure studentInfo exists
          if (!profile.studentInfo) {
            profile.studentInfo = {
              registrationNo: '',
              phone: '',
              email: '',
              dateOfBirth: '',
              department: user.profile.department || '', // Set department from user profile
              academicInfo: {
                semesterRecords: [],
                cgpa: 0,
                backlogs: [],
                currentSemester: 1,
                year: 1
              }
            };
          }
          // Store original department to preserve it
          const originalDepartment = profile.studentInfo.department;
          // Update profile with student-specific data
          profile.studentInfo.fatherName = student.fathers_name;
          profile.studentInfo.dateOfBirth = student.date_of_birth;
          profile.studentInfo.phone = student.phone || profile.studentInfo.phone;
          // Preserve department from user profile
          profile.studentInfo.department = originalDepartment;
        }
      }
      
      // Save the profile to persist department changes
      await profile.save();
      
      // Populate the updated profile to include user data
      await profile.populate('userId', '-password');
      
      // Restructure response to match frontend expectations
      const profileObj = profile.toObject();
      
      // Create response data with proper field mapping for frontend
      const responseData = {
        ...profileObj,
        // For students, map field names to match frontend expectations
        ...(profileObj.role === 'student' && profileObj.studentInfo ? {
          studentInfo: {
            ...profileObj.studentInfo,
            fathers_name: profileObj.studentInfo.fatherName, // Map fatherName to fathers_name
            date_of_birth: profileObj.studentInfo.dateOfBirth, // Map dateOfBirth to date_of_birth
          }
        } : {}),
        user: profileObj.userId  // Move populated user data to 'user' field
      };
      
      // Remove the userId field to avoid duplication
      const { userId, ...finalResponse } = responseData;
      
      res.status(200).json({
        success: true,
        data: finalResponse,
        message: profile ? 'Profile updated successfully' : 'Profile created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create or update profile'
      });
    }
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
    let profile = await Profile.findOne({ userId: req.user!._id });
    
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
    
    // For students, enrich the profile with data from Student model
    if (profile.role === 'student') {
      const student = await Student.findOne({ userId: req.user!._id });
      if (student) {
        // Ensure studentInfo exists
        if (!profile.studentInfo) {
          profile.studentInfo = {
            registrationNo: '',
            phone: '',
            email: '',
            dateOfBirth: '',
            department: '',
            academicInfo: {
              semesterRecords: [],
              cgpa: 0,
              backlogs: [],
              currentSemester: 1,
              year: 1
            }
          };
        }
        // Store original department to preserve it
        const originalDepartment = profile.studentInfo.department;
        // Update profile with student-specific data
        profile.studentInfo.fatherName = student.fathers_name;
        profile.studentInfo.dateOfBirth = student.date_of_birth;
        profile.studentInfo.phone = student.phone || profile.studentInfo.phone;
        // Preserve department from user profile
        profile.studentInfo.department = originalDepartment;
      }
    }
    
    // Populate the updated profile to include user data
    await profile.populate('userId', '-password');
    
    // Restructure response to match frontend expectations
    const profileObj = profile.toObject();
    
    // Create response data with proper field mapping for frontend
    const responseData = {
      ...profileObj,
      // For students, map field names to match frontend expectations
      ...(profileObj.role === 'student' && profileObj.studentInfo ? {
        studentInfo: {
          ...profileObj.studentInfo,
          fathers_name: profileObj.studentInfo.fatherName, // Map fatherName to fathers_name
          date_of_birth: profileObj.studentInfo.dateOfBirth, // Map dateOfBirth to date_of_birth
        }
      } : {}),
      user: profileObj.userId  // Move populated user data to 'user' field
    };
    
    // Remove the userId field to avoid duplication
    const { userId, ...finalResponse } = responseData;
    
    res.status(200).json({
      success: true,
      data: finalResponse,
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
    let profile = await Profile.findOne({ userId: req.user!._id });
    
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
    
    // For students, enrich the profile with data from Student model
    if (profile.role === 'student') {
      const student = await Student.findOne({ userId: req.user!._id });
      if (student) {
        // Ensure studentInfo exists
        if (!profile.studentInfo) {
          profile.studentInfo = {
            registrationNo: '',
            phone: '',
            email: '',
            dateOfBirth: '',
            department: '',
            academicInfo: {
              semesterRecords: [],
              cgpa: 0,
              backlogs: [],
              currentSemester: 1,
              year: 1
            }
          };
        }
        // Store original department to preserve it
        const originalDepartment = profile.studentInfo.department;
        // Update profile with student-specific data
        profile.studentInfo.fatherName = student.fathers_name;
        profile.studentInfo.dateOfBirth = student.date_of_birth;
        profile.studentInfo.phone = student.phone || profile.studentInfo.phone;
        // Preserve department from user profile
        profile.studentInfo.department = originalDepartment;
      }
    }
    
    // Populate the updated profile to include user data
    await profile.populate('userId', '-password');
    
    // Restructure response to match frontend expectations
    const profileObj = profile.toObject();
    
    // Create response data with proper field mapping for frontend
    const responseData = {
      ...profileObj,
      // For students, map field names to match frontend expectations
      ...(profileObj.role === 'student' && profileObj.studentInfo ? {
        studentInfo: {
          ...profileObj.studentInfo,
          fathers_name: profileObj.studentInfo.fatherName, // Map fatherName to fathers_name
          date_of_birth: profileObj.studentInfo.dateOfBirth, // Map dateOfBirth to date_of_birth
        }
      } : {}),
      user: profileObj.userId  // Move populated user data to 'user' field
    };
    
    // Remove the userId field to avoid duplication
    const { userId, ...finalResponse } = responseData;
    
    res.status(200).json({
      success: true,
      data: finalResponse,
      message: 'College name updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  uploadProfilePic(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 2MB.',
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      // Find existing profile
      let profile = await Profile.findOne({ userId: req.user!._id });
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      // Determine which profile section to update based on user role
      if (profile.role === 'student' && profile.studentInfo) {
        profile.studentInfo.profilePic = `/uploads/profile-pics/${req.file.filename}`;
      } else if ((profile.role === 'teacher' || profile.role === 'tpo') && profile.employeeInfo) {
        profile.employeeInfo.profilePic = `/uploads/profile-pics/${req.file.filename}`;
      } else if (profile.role === 'admin' && profile.adminInfo) {
        profile.adminInfo.profilePic = `/uploads/profile-pics/${req.file.filename}`;
      }

      await profile.save();
      
      // For students, enrich the profile with data from Student model
      if (profile.role === 'student') {
        const student = await Student.findOne({ userId: req.user!._id });
        if (student) {
          // Ensure studentInfo exists
          if (!profile.studentInfo) {
            profile.studentInfo = {
              registrationNo: '',
              phone: '',
              email: '',
              dateOfBirth: '',
              department: '',
              academicInfo: {
                semesterRecords: [],
                cgpa: 0,
                backlogs: [],
                currentSemester: 1,
                year: 1
              }
            };
          }
          // Update profile with student-specific data
          profile.studentInfo.fatherName = student.fathers_name;
          profile.studentInfo.dateOfBirth = student.date_of_birth;
          profile.studentInfo.phone = student.phone || profile.studentInfo.phone;
        }
      }
      
      // Populate the updated profile to include user data
      await profile.populate('userId', '-password');
      
      // Restructure response to match frontend expectations
      const profileObj = profile.toObject();
      
      // Create response data with proper field mapping for frontend
      const responseData = {
        ...profileObj,
        // For students, map field names to match frontend expectations
        ...(profileObj.role === 'student' && profileObj.studentInfo ? {
          studentInfo: {
            ...profileObj.studentInfo,
            fathers_name: profileObj.studentInfo.fatherName, // Map fatherName to fathers_name
            date_of_birth: profileObj.studentInfo.dateOfBirth, // Map dateOfBirth to date_of_birth
          }
        } : {}),
        user: profileObj.userId  // Move populated user data to 'user' field
      };
      
      // Remove the userId field to avoid duplication
      const { userId, ...finalResponse } = responseData;
      
      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: finalResponse
      });
    } catch (error: any) {
      // Clean up: delete the uploaded file if DB operation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload profile picture',
      });
    }
  });
};