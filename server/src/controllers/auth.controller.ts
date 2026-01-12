import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User.model';
import Student from '../models/Student.model';
import { AuthRequest } from '../middleware/auth.middleware';



// Generate JWT Token
const generateToken = (id: string): string => {
  const secret: jwt.Secret = (process.env.JWT_SECRET || 'placement-platform-secret-key-dev-12345678901234567890') as jwt.Secret;
  const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '7d') as unknown as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ id }, secret, options);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role, profile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'student',
      profile,
    });

    // Create student profile if role is student
    if (user.role === 'student') {
      await Student.create({
        userId: user._id,
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is inactive' });
      return;
    }

    // Check if password matches
    console.log(`Attempting login for user ${email} with provided password: '${password}' (length: ${password.length})`);
    console.log(`User's role: ${user.role}`);
    
    // Log the raw password hash for debugging (be careful with this in production)
    console.log(`Stored password hash: ${user.password}`);
    
    // Normalize the incoming password to handle potential encoding issues
    let normalizedPassword = password;
    
    // Handle potential mobile-specific encoding issues
    normalizedPassword = normalizedPassword.replace(/\u00a0/g, ' '); // Replace non-breaking spaces with regular spaces
    normalizedPassword = normalizedPassword.normalize('NFKD'); // Normalize Unicode characters
    
    console.log(`Normalized password: '${normalizedPassword}' (length: ${normalizedPassword.length})`);
    
    // For students, verify email ends with @gcekbpatna.ac.in and use specific password format
    if (user.role === 'student') {
      // Check if email ends with @gcekbpatna.ac.in
      if (!email.toLowerCase().endsWith('@gcekbpatna.ac.in')) {
        console.log(`Student login failed: Email does not end with @gcekbpatna.ac.in`);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
      
      // For student login, compute the expected password: first 4 letters of name (uppercase) + year of birth
      // We need to get the student's name and date of birth to construct the expected password
      const studentRecord = await Student.findOne({ userId: user._id });
      if (!studentRecord) {
        console.log(`Student record not found for user ${user._id}`);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
      
      // Construct the expected password: first 4 letters of full name (first + last) + year of birth
      const fullName = `${user.profile.firstName} ${user.profile.lastName}`.trim();
      const namePart = fullName.substring(0, 4).toUpperCase();
      
      // Get year from date of birth
      const dateOfBirth = studentRecord.date_of_birth;
      const dateParts = dateOfBirth.split('-'); // YYYY-MM-DD format
      const yearOfBirth = dateParts[0] || '0000';
      
      const expectedPassword = namePart + yearOfBirth;
      console.log(`Expected student password: ${namePart} + ${yearOfBirth} = ${expectedPassword}`);
      
      // For student users, we compute the expected password and verify it against the input
      // rather than checking against the stored hash (which may be from a previous system)
      if (normalizedPassword === expectedPassword) {
        console.log(`Login successful for student ${email} with computed password match.`);
        
        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
          },
        });
        return;
      }
      
      console.log(`Student login failed: Input password '${normalizedPassword}' does not match expected password '${expectedPassword}'.`);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    } else {
      // For teachers and TPOs, use the same password format as students: first 4 letters of name + year of birth
      if (user.role === 'teacher' || user.role === 'tpo') {
        // Construct the expected password: first 4 letters of first name + year of birth
        // The firstName in the profile should already be cleaned of titles
        let namePart = user.profile.firstName.substring(0, 4).toUpperCase();
        // Ensure it's exactly 4 characters by padding with spaces if needed
        namePart = namePart.padEnd(4, ' ').substring(0, 4);
        
        // For teachers/TPOs, get year from date of birth in the user profile if available
        let yearOfBirth = '0000';
        
        // Check if there's date_of_birth in the user profile
        if (user.profile.dateOfBirth) {
          const dateOfBirth = user.profile.dateOfBirth;
          const dateParts = dateOfBirth.split('-'); // YYYY-MM-DD format
          yearOfBirth = dateParts[0] || '0000';
        }
        
        const expectedPassword = namePart + yearOfBirth;
        console.log(`Expected ${user.role} password: ${namePart} + ${yearOfBirth} = ${expectedPassword}`);
        
        // Check if the provided password matches the expected format
        if (normalizedPassword === expectedPassword) {
          console.log(`Login successful for ${user.role} ${email} with computed password match.`);
          
          // Generate token
          const token = generateToken(user._id.toString());

          res.status(200).json({
            success: true,
            token,
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              profile: user.profile,
            },
          });
          return;
        }
      }
      
      // For other roles (admin) or if computed password doesn't match, use standard password comparison
      const isMatch = await user.comparePassword(normalizedPassword);
      console.log(`Password comparison result: ${isMatch}`);
      
      if (isMatch) {
        console.log(`Login successful for user ${email} with role ${user.role}.`);
        
        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
          },
        });
        return;
      }
    }
    
    console.log(`Login failed for user ${email}: Provided password '${normalizedPassword}' does not match stored hash.`);
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
    
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
    
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile: { ...req.user.profile, ...updates } } },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
