import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import Student from '../models/Student.model';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // await Student.deleteMany({});

    // Default users data
    const defaultUsers = [
      {
        email: 'student@example.com',
        password: 'student123',
        role: 'student' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          department: 'Computer Science',
          year: 3,
          rollNumber: 'CS2021001',
          enrollmentNumber: 'EN2021001',
          course: 'B.Tech',
          specialization: 'Software Engineering',
          phone: '+1234567890',
        },
      },
      {
        email: 'tpo@example.com',
        password: 'tpo123',
        role: 'tpo' as const,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          department: 'Training & Placement',
          phone: '+1234567891',
        },
      },
      {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin' as const,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          department: 'Administration',
          phone: '+1234567892',
        },
      },
      {
        email: 'teacher@example.com',
        password: 'teacher123',
        role: 'teacher' as const,
        profile: {
          firstName: 'Professor',
          lastName: 'Johnson',
          department: 'Computer Science',
          phone: '+1234567893',
        },
      },
    ];

    // Create users
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Skipping...`);
        continue;
      }

      // Create user (password will be hashed automatically by the pre-save hook)
      const user = await User.create(userData);
      console.log(`✓ Created user: ${userData.email} (${userData.role})`);

      // If student, create student profile
      if (userData.role === 'student') {
        const existingStudent = await Student.findOne({ userId: user._id });
        if (!existingStudent) {
          await Student.create({
            userId: user._id,
          });
          console.log(`✓ Created student profile for: ${userData.email}`);
        }
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍🎓 Student:');
    console.log('   Email: student@example.com');
    console.log('   Password: student123');
    console.log('\n👔 TPO:');
    console.log('   Email: tpo@example.com');
    console.log('   Password: tpo123');
    console.log('\n👑 Admin:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n👨‍🏫 Teacher:');
    console.log('   Email: teacher@example.com');
    console.log('   Password: teacher123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
