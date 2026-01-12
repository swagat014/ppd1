import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import User from '../models/User.model';
import Student from '../models/Student.model';
import Department from '../models/Department.model';
import { AuthRequest } from '../middleware/auth.middleware';
import * as bcrypt from 'bcryptjs';

// import * as jwt from 'jsonwebtoken'; // Not needed for CSV upload functionality

// Helper function to create a default password based on name and date of birth
function createDefaultPassword(name: string, dateOfBirth?: string): string {
  // Take first 4 letters of the first name and capitalize them, pad with spaces if needed
  const nameParts = name.split(' ');
  const firstName = nameParts[0];
  let namePart = firstName.substring(0, 4).toUpperCase();
  // Ensure it's exactly 4 characters by padding with spaces if needed
  namePart = namePart.padEnd(4, ' ').substring(0, 4);

  // Extract year from date of birth if available
  let yearOfBirth = '0000';
  if (dateOfBirth) {
    const dateParts = dateOfBirth.split('-'); // YYYY-MM-DD format
    yearOfBirth = dateParts[0] || '0000';
  }

  const tempPassword = namePart + yearOfBirth;
  return tempPassword;
}

// Helper function to convert various date formats to YYYY-MM-DD
function convertToStandardDateFormat(dateString: string): string {
  // Trim whitespace
  dateString = dateString.trim();
  
  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Normalize separator to dash for consistent processing
  let normalizedDate = dateString.replace(/[\/]/g, '-');
  
  // Handle MM-DD-YYYY format
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(normalizedDate)) {
    const parts = normalizedDate.split('-');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  }
  
  // Handle DD-MM-YYYY format (European format)
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(normalizedDate)) {
    const parts = normalizedDate.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Simple heuristic: if first part is > 12, assume it's DD-MM-YYYY
      if (parseInt(day) > 12) {
        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
      }
    }
  }
  
  // If no format matched, return original
  return dateString;
}

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
          dateOfBirth: user.profile.dateOfBirth, // Include date of birth for all users
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
    const { name, email, phone, department, role, isActive, studentData, dateOfBirth } = req.body;

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
          ...(dateOfBirth && { dateOfBirth }), // Only include dateOfBirth if it exists
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
    
    // If it's a student and studentData is provided, update the student profile
    if (role === 'student' && studentData) {
      let student = await Student.findOne({ userId: updatedUser._id });
      if (student) {
        // Update existing student
        student.fathers_name = studentData.fathers_name;
        student.phone = studentData.phone || phone;
        student.date_of_birth = studentData.date_of_birth;
        await student.save();
      } else {
        // Create new student profile
        student = new Student({
          userId: updatedUser._id,
          fathers_name: studentData.fathers_name,
          phone: studentData.phone || phone,
          date_of_birth: studentData.date_of_birth,
        });
        await student.save();
      }
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

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, department, role, isActive, studentData, dateOfBirth: inputDateOfBirth } = req.body;

    // Validation
    if (!name || !email || !role) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and role are required',
      });
      return;
    }

    // Validate role
    const validRoles = ['student', 'teacher', 'tpo', 'admin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, teacher, tpo, or admin',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[\w._%+-]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // For students, validate email ends with @gcekbpatna.ac.in
    if (role === 'student') {
      const studentEmailRegex = /^[\w._%+-]+@gcekbpatna\.ac\.in$/i;
      if (!studentEmailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: `Invalid email format for student (${email}). Must end with @gcekbpatna.ac.in`,
        });
        return;
      }
    }

    // Validate phone number format
    if (phone) {
      const phoneDigits = phone.replace(/[^\d]/g, '');
      if (phoneDigits.length < 7) {
        res.status(400).json({
          success: false,
          message: `Invalid phone number format (${phone}) - must be at least 7 digits`,
        });
        return;
      }
    }

    // Validate date of birth format if provided
    let validatedDateOfBirth = inputDateOfBirth; // Use the renamed variable to avoid reassignment
    if (validatedDateOfBirth && typeof validatedDateOfBirth === 'string') {
      // Support multiple date formats: YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY
      // Convert to YYYY-MM-DD format
      let originalDate = validatedDateOfBirth.toString().replace(/^"|"$/g, '').trim();
      originalDate = convertToStandardDateFormat(originalDate);

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
      if (!dateRegex.test(originalDate)) {
        res.status(400).json({
          success: false,
          message: `Invalid date of birth format (expected YYYY-MM-DD, got ${originalDate})`,
        });
        return;
      }

      // Additional validation: check if it's a valid date
      const date = new Date(originalDate);
      if (isNaN(date.getTime())) {
        res.status(400).json({
          success: false,
          message: `Invalid date value (${originalDate})`,
        });
        return;
      }

      // Update the validatedDateOfBirth with the standardized format
      validatedDateOfBirth = originalDate;
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: `User with email ${email} already exists`,
      });
      return;
    }

    // Split name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create default password based on name and date of birth
    const tempPassword = createDefaultPassword(name, validatedDateOfBirth);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      profile: {
        firstName,
        lastName,
        phone: phone || '',
        department: department || '',
        ...(validatedDateOfBirth && { dateOfBirth: validatedDateOfBirth }), // Only include dateOfBirth if it exists
      },
      isActive: isActive !== undefined ? isActive : true,
    });

    // If user is a student and studentData is provided, create student-specific fields
    if (role === 'student' && studentData) {
      await Student.create({
        userId: newUser._id,
        fathers_name: studentData.fathers_name || '',
        phone: studentData.phone || phone || '',
        date_of_birth: studentData.date_of_birth || validatedDateOfBirth || '',
      });
    }

    // Fetch the created user without password
    const userWithoutPassword = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during user creation',
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

    const userType = req.body.userType as 'student' | 'teacher' | 'tpo';
    
    // Default to 'student' if userType is not provided
    const validatedUserType = userType || 'student';
    
    if (!['student', 'teacher', 'tpo'].includes(validatedUserType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be student, teacher, or tpo',
      });
    }
    
    console.log(`Processing upload for user type: ${validatedUserType}`);

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
      console.log(`Processing ${rows.length} rows from CSV`);
      
      // Track emails to detect duplicates in the same CSV file
      const processedEmails = new Set<string>();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Processing row ${i + 2}:`, row); // i+2 because row 0 is header, so actual data starts at row 2
        
        // Check for duplicate email in the same CSV file
        const email = (row.email || '').toString().trim().toLowerCase();
        if (processedEmails.has(email)) {
          errors.push(`Row ${i + 2}: Duplicate email ${email} found in this CSV file`);
          continue;
        }
        processedEmails.add(email);
        
        try {
          // Validate required fields based on user type
          if (!row.name) {
            errors.push(`Row ${i + 2}: Missing required field 'name'`);
            continue;
          }
          if (!row.phone) {
            errors.push(`Row ${i + 2}: Missing required field 'phone'`);
            continue;
          }
          if (!row.email) {
            errors.push(`Row ${i + 2}: Missing required field 'email'`);
            continue;
          }
          
          if (validatedUserType === 'student') {
            if (!row.father_name) {
              errors.push(`Row ${i + 2}: Missing required field 'father_name'`);
              continue;
            }
            if (!row.date_of_birth) {
              errors.push(`Row ${i + 2}: Missing required field 'date_of_birth'`);
              continue;
            }
          } else {
            // For teachers and TPOs, date_of_birth is optional but if provided, should be valid
            if (row.date_of_birth && typeof row.date_of_birth === 'string') {
              // Support multiple date formats: YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY
              // Convert to YYYY-MM-DD format
              let originalDate = row.date_of_birth.toString().replace(/^"|"$/g, '').trim();
              originalDate = convertToStandardDateFormat(originalDate);
              
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
              if (!dateRegex.test(originalDate)) {
                errors.push(`Row ${i + 2}: Invalid date of birth format (expected YYYY-MM-DD, got ${originalDate})`);
                continue;
              }
              
              // Additional validation: check if it's a valid date
              const date = new Date(originalDate);
              if (isNaN(date.getTime())) {
                errors.push(`Row ${i + 2}: Invalid date value (${originalDate})`);
                continue;
              }
              
              // Update the row with the standardized date
              row.date_of_birth = originalDate;
            }
          }
          
          // Validate email format
          if (!row.email || typeof row.email !== 'string') {
            errors.push(`Row ${i + 2}: Missing or invalid email field`);
            continue;
          }
                    
          // For students, validate email ends with @gcekbpatna.ac.in
          if (validatedUserType === 'student') {
            const emailRegex = /^[\w._%+-]+@gcekbpatna\.ac\.in$/i;
            if (!emailRegex.test(row.email.trim())) {
              errors.push(`Row ${i + 2}: Invalid email format for student (${row.email.trim()}). Must end with @gcekbpatna.ac.in`);
              continue;
            }
          } else {
            // For teachers and TPOs, validate general email format
            const emailRegex = /^[\w._%+-]+@([\w-]+\.)+[\w-]{2,}$/;
            if (!emailRegex.test(row.email.trim())) {
              errors.push(`Row ${i + 2}: Invalid email format (${row.email.trim()})`);
              continue;
            }
          }
          
          // Additional validation for students: date of birth is already validated above
          
          // Validate phone number format
          if (!row.phone || typeof row.phone !== 'string') {
            errors.push(`Row ${i + 2}: Missing or invalid phone field`);
            continue;
          }
          
          // Basic phone validation - should be at least 7 digits
          const phoneDigits = row.phone.replace(/[^\d]/g, '');
          if (phoneDigits.length < 7) {
            errors.push(`Row ${i + 2}: Invalid phone number format (${row.phone}) - must be at least 7 digits`);
            continue;
          }
          
          // Validate name format
          if (!row.name || typeof row.name !== 'string' || row.name.trim().length < 1) {
            errors.push(`Row ${i + 2}: Invalid name field`);
            continue;
          }
          
          // Validate father's name for students
          if (validatedUserType === 'student' && (!row.father_name || typeof row.father_name !== 'string' || row.father_name.trim().length < 1)) {
            errors.push(`Row ${i + 2}: Invalid father_name field`);
            continue;
          }

          // Split name into first and last name (after removing titles)
          const name = row.name || '';
          // Remove common titles/prefixes and get just the name part
          const cleanedName = name.replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|Miss\.?)\s*/i, '').trim();
          const nameParts = cleanedName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          // Check if user already exists by email
          let existingUser = await User.findOne({ email: row.email }).select('+password');
          
          // For all user types, create password from first 4 letters of name (capitalized) + year of birth
          let tempPassword = 'TempPassword123!'; // Default fallback
                      
          // Take first 4 letters of the first name and capitalize them, pad with spaces if needed
          let namePart = firstName.substring(0, 4).toUpperCase();
          // Ensure it's exactly 4 characters by padding with spaces if needed
          namePart = namePart.padEnd(4, ' ').substring(0, 4);
                      
          // Extract year from date of birth if available
          let yearOfBirth = '0000';
          if (row.date_of_birth) {
            const dob = row.date_of_birth;
            const dateParts = dob.split('-'); // YYYY-MM-DD format
            yearOfBirth = dateParts[0] || '0000';
          }
                      
          tempPassword = namePart + yearOfBirth;
          console.log(`Creating password for ${row.email} (${validatedUserType}): ${namePart} + ${yearOfBirth} = ${tempPassword}`);
                      
          // Validate the constructed password
          if (tempPassword.length !== 8 || !/^[A-Z]{4}\d{4}$/.test(tempPassword)) {
            errors.push(`Row ${i + 2}: Invalid password format (${tempPassword}) for ${validatedUserType} ${row.email}`);
            continue;
          }
          
          if (existingUser) {
            // Update existing user
            existingUser.profile.firstName = firstName;
            existingUser.profile.lastName = lastName;
            existingUser.profile.phone = row.phone;
            existingUser.profile.department = row.department || existingUser.profile.department || '';
            if (row.date_of_birth) {
              existingUser.profile.dateOfBirth = row.date_of_birth;
            }
            existingUser.role = validatedUserType;
            
            console.log(`Updating user with email ${row.email}, role ${validatedUserType}, original date_of_birth: ${row.date_of_birth}, final password: '${tempPassword}' (length: ${tempPassword.length})`);
            
            // Debug: Show what the password looks like in hex to see hidden characters
            console.log(`Password in hex: ${Buffer.from(tempPassword).toString('hex')}`);
            
            existingUser.password = await bcrypt.hash(tempPassword, 10);
            console.log(`Generated hash: ${existingUser.password}`);
            
            await existingUser.save();
            
            // If user is a student, also update student-specific fields
            if (validatedUserType === 'student') {
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
            console.log(`Creating user with email ${row.email}, role ${validatedUserType}, original date_of_birth: ${row.date_of_birth}, final password: '${tempPassword}' (length: ${tempPassword.length})`);
            
            // Debug: Show what the password looks like in hex to see hidden characters
            console.log(`Password in hex: ${Buffer.from(tempPassword).toString('hex')}`);
            
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            console.log(`Generated hash: ${hashedPassword}`);
            
            const newUser = await User.create({
              email: row.email,
              password: hashedPassword,
              role: validatedUserType,
              profile: {
                firstName,
                lastName,
                phone: row.phone,
                department: row.department || '',
                ...(row.date_of_birth && { dateOfBirth: row.date_of_birth }), // Only include dateOfBirth if it exists
              },
              isActive: true,
            });
            
            // If user is a student, create student-specific fields
            if (validatedUserType === 'student') {
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
          // Handle duplicate email error specifically
          if (error.code === 11000) {
            // Duplicate key error
            const duplicateEmail = error.keyValue.email;
            errors.push(`Row ${i + 2}: Email ${duplicateEmail} already exists in the database. Skipping duplicate entry.`);
          } else {
            errors.push(`Row ${i + 2}: ${error.message || 'Error processing row'}`);
          }
        }
      }

      // Clean up: delete the temporary file
      fs.unlinkSync(req.file.path);
      
      console.log(`Upload completed: ${createdCount} created, ${updatedCount} updated, ${errors.length} errors`);

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

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin only)
export const getAllDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await Department.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private (Admin only)
export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
      return;
    }
    
    // Check if department already exists
    const existingDept = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingDept) {
      res.status(400).json({
        success: false,
        message: 'Department already exists',
      });
      return;
    }
    
    const department = await Department.create({ name });
    
    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin only)
export const updateDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, isActive } = req.body;
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, isActive },
      { new: true, runValidators: true }
    );
    
    if (!department) {
      res.status(404).json({
        success: false,
        message: 'Department not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: department,
      message: 'Department updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin only)
export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      res.status(404).json({
        success: false,
        message: 'Department not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
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
    
    // Define the known departments list
    const departmentsList = [
      'Computer Science & Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics & Communication Engineering',
      'Information Technology',
      'Applied Sciences',
      'Management Studies',
    ];
    
    // Count unique departments from users
    const uniqueDepartments = await User.distinct('profile.department', { 'profile.department': { $nin: [null, ''] } });
    const departmentsCount = Math.max(departmentsList.length, uniqueDepartments.length);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        students: studentsCount,
        teachers: teachersCount,
        tpos: tposCount,
        admins: adminsCount,
        departments: departmentsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};