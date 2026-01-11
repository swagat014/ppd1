import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import User from '../models/User.model';
import Student from '../models/Student.model';
import { AuthRequest } from '../middleware/auth.middleware';
import * as jwt from 'jsonwebtoken';

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/csv';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `csv_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed')); // This error will be caught by the route handler
    }
  },
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all users
    const users = await User.find({})
      .select('-password') // Don't return passwords
      .sort({ createdAt: -1 });

    // Extract student user IDs to fetch student info in one query
    const studentUserIds = users
      .filter(user => user.role === 'student')
      .map(user => user._id);

    // Fetch all student info in one query
    const students = await Student.find({
      userId: { $in: studentUserIds }
    });

    // Create a map for quick lookup
    const studentMap = new Map();
    students.forEach(student => {
      studentMap.set(student.userId.toString(), student);
    });

    // Combine user and student data
    const usersWithDetails = users.map(user => {
      const userData = {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          phone: user.profile.phone,
          department: user.profile.department,
        },
        isActive: user.isActive,
        createdAt: user.createdAt,
      };

      if (user.role === 'student') {
        const student = studentMap.get(user._id.toString());
        if (student) {
          (userData as any).studentInfo = {
            fathers_name: student.fathers_name,
            phone: student.phone,
            date_of_birth: student.date_of_birth,
          };
        }
      }

      return userData;
    });

    res.status(200).json({
      success: true,
      data: usersWithDetails,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get additional student info if user is a student
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: {
            name: `${user.profile.firstName} ${user.profile.lastName}`,
            phone: user.profile.phone,
            department: user.profile.department,
          },
          isActive: user.isActive,
          createdAt: user.createdAt,
          studentInfo: student ? {
            fathers_name: student.fathers_name,
            phone: student.phone,
            date_of_birth: student.date_of_birth,
          } : null,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: {
            name: `${user.profile.firstName} ${user.profile.lastName}`,
            phone: user.profile.phone,
            department: user.profile.department,
          },
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, department, role, isActive } = req.body;

    // Split name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        email,
        role,
        isActive,
        profile: {
          firstName,
          lastName,
          phone,
          department,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // If it's a student, also delete the student profile
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Bulk delete users
// @route   DELETE /api/admin/users/bulk
// @access  Private (Admin only)
export const bulkDeleteUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No user IDs provided',
      });
      return;
    }

    // Get users to check their roles
    const users = await User.find({ _id: { $in: ids } });

    // Delete student profiles for students being deleted
    for (const user of users) {
      if (user.role === 'student') {
        await Student.findOneAndDelete({ userId: user._id });
      }
    }

    // Delete the users
    await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${ids.length} users deleted successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Upload users via CSV
// @route   POST /api/admin/users/upload
// @access  Private (Admin only)
export const uploadUsers = (req: AuthRequest, res: Response): void => {
  // Use multer middleware to handle file upload
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.',
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

    const userType = req.body.userType as 'student' | 'teacher' | 'tpo' || 'student';
    
    if (!['student', 'teacher', 'tpo'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be student, teacher, or tpo',
      });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let createdCount = 0;
    let updatedCount = 0;

    try {
      // Process the CSV file
      const rows: any[] = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file!.path)
          .pipe(csv())
          .on('data', (row) => {
            rows.push(row);
          })
          .on('end', () => {
            resolve(rows);
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          // Validate required fields based on user type
          if (userType === 'student') {
            if (!row.name || !row.father_name || !row.phone || !row.date_of_birth || !row.email) {
              errors.push(`Row ${i + 2}: Missing required fields (name, father_name, phone, date_of_birth, email)`);
              continue;
            }
          } else {
            if (!row.name || !row.phone || !row.email) {
              errors.push(`Row ${i + 2}: Missing required fields (name, phone, email)`);
              continue;
            }
          }

          // Split name into first and last name
          const nameParts = row.name.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          // Check if user already exists by email
          let existingUser = await User.findOne({ email: row.email });
          
          if (existingUser) {
            // Update existing user
            existingUser.profile.firstName = firstName;
            existingUser.profile.lastName = lastName;
            existingUser.profile.phone = row.phone;
            existingUser.profile.department = row.department || '';
            existingUser.role = userType;
            
            await existingUser.save();
            
            // If user is a student, also update student-specific fields
            if (userType === 'student') {
              let student = await Student.findOne({ userId: existingUser._id });
              if (!student) {
                student = new Student({
                  userId: existingUser._id,
                  fathers_name: row.father_name,
                  phone: row.phone,
                  date_of_birth: row.date_of_birth,
                });
              } else {
                student.fathers_name = row.father_name;
                student.phone = row.phone;
                student.date_of_birth = row.date_of_birth;
              }
              await student.save();
            }
            
            updatedCount++;
          } else {
            // Create new user
            const newUser = await User.create({
              email: row.email,
              password: 'TempPassword123!', // Default password for bulk uploads
              role: userType,
              profile: {
                firstName,
                lastName,
                phone: row.phone,
                department: row.department || '',
              },
              isActive: true,
            });
            
            // If user is a student, create student-specific fields
            if (userType === 'student') {
              await Student.create({
                userId: newUser._id,
                fathers_name: row.father_name,
                phone: row.phone,
                date_of_birth: row.date_of_birth,
              });
            }
            
            createdCount++;
          }
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message || 'Error processing row'}`);
        }
      }

      // Clean up: delete the temporary file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: 'Users uploaded successfully',
        createdCount,
        updatedCount,
        totalProcessed: createdCount + updatedCount,
        errors,
      });
    } catch (error: any) {
      // Clean up: delete the temporary file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during CSV processing',
      });
    }
  });
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({});
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });
    const tposCount = await User.countDocuments({ role: 'tpo' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        students: studentsCount,
        teachers: teachersCount,
        tpos: tposCount,
        admins: adminsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};