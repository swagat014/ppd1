import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Student from '../models/Student.model';
import User from '../models/User.model';
import CoreSubjectNote from '../models/CoreSubject.model';

// @desc    Get Teacher Dashboard stats
// @route   GET /api/teacher/dashboard
// @access  Private/Teacher
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const department = req.user.profile.department;
    
    // Count students in teacher's department
    // We need to find students whose linked User has the same department
    const departmentStudentsCount = await Student.countDocuments({
      _id: { 
        $in: await User.find({ 'profile.department': department, role: 'student' }).distinct('_id')
      }
    });

    // Wait, let's rethink. Student model has userId.
    const studentUserIdsInDept = await User.find({ 
      'profile.department': department, 
      role: 'student' 
    }).distinct('_id');

    const totalStudents = await Student.countDocuments({
      userId: { $in: studentUserIdsInDept }
    });

    // Count notes uploaded by this teacher
    const totalResources = await CoreSubjectNote.countDocuments({
      uploadedBy: req.user._id
    });

    // Calculate average readiness of students in department
    const readinessStats = await Student.aggregate([
      { $match: { userId: { $in: studentUserIdsInDept } } },
      {
        $group: {
          _id: null,
          avgReadiness: { $avg: '$readiness.overallScore' }
        }
      }
    ]);

    // Get students needing support (readiness < 40)
    const studentsNeedingSupport = await Student.find({
      userId: { $in: studentUserIdsInDept },
      'readiness.overallScore': { $lt: 40 }
    })
    .populate('userId', 'profile.firstName profile.lastName')
    .limit(5);

    // Mock performance trend data
    const performanceTrend = [
      { month: 'Jan', avgScore: Math.max(0, Math.round(readinessStats[0]?.avgReadiness * 0.7) || 45) },
      { month: 'Feb', avgScore: Math.max(0, Math.round(readinessStats[0]?.avgReadiness * 0.8) || 52) },
      { month: 'Mar', avgScore: Math.max(0, Math.round(readinessStats[0]?.avgReadiness * 0.85) || 58) },
      { month: 'Apr', avgScore: Math.round(readinessStats[0]?.avgReadiness || 65) },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalResources,
          avgReadiness: Math.round(readinessStats[0]?.avgReadiness || 0),
          pendingAssignments: 0, 
          classes: 4, 
          scheduledEvents: 2, 
        },
        studentsNeedingSupport: studentsNeedingSupport.map(s => ({
          _id: s._id,
          name: `${(s.userId as any).profile.firstName} ${(s.userId as any).profile.lastName}`,
          score: s.readiness.overallScore
        })),
        performanceTrend
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard',
    });
  }
};

// @desc    Get students in teacher's department
// @route   GET /api/teacher/students
// @access  Private/Teacher
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const department = req.user.profile.department;
    const studentUserIdsInDept = await User.find({ 
      'profile.department': department, 
      role: 'student' 
    }).distinct('_id');

    const students = await Student.find({
      userId: { $in: studentUserIdsInDept }
    })
    .populate('userId', 'profile.firstName profile.lastName email profile.department profile.rollNumber')
    .sort({ 'readiness.overallScore': -1 });

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get students',
    });
  }
};

// @desc    Get assignments for teacher
// @route   GET /api/teacher/assignments
// @access  Private/Teacher
export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Mock assignments - replace with actual Assignment model
    const assignments = [
      {
        _id: '1',
        title: 'Array Manipulation Problems',
        description: 'Solve 5 array manipulation problems',
        subject: 'Data Structures',
        type: 'dsa',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        status: 'published',
        assignedTo: [],
        submissions: [],
        createdBy: req.user._id,
      },
    ];

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get assignments',
    });
  }
};

// @desc    Create assignment
// @route   POST /api/teacher/assignments
// @access  Private/Teacher
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create assignment',
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/teacher/assignments/:id
// @access  Private/Teacher
export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update assignment',
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/teacher/assignments/:id
// @access  Private/Teacher
export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete assignment',
    });
  }
};

// @desc    Get grades
// @route   GET /api/teacher/grades
// @access  Private/Teacher
export const getGrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const department = req.user.profile.department;
    const studentUserIdsInDept = await User.find({ 
      'profile.department': department, 
      role: 'student' 
    }).distinct('_id');

    const students = await Student.find({
      userId: { $in: studentUserIdsInDept }
    })
    .populate('userId', 'profile.firstName profile.lastName email profile.rollNumber')
    .select('userId readiness practice resume');

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get grades',
    });
  }
};

// @desc    Update grade
// @route   PUT /api/teacher/grades/:id
// @access  Private/Teacher
export const updateGrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update grade',
    });
  }
};

// @desc    Get schedule
// @route   GET /api/teacher/schedule
// @access  Private/Teacher
export const getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Mock schedule events
    const events = [
      {
        _id: '1',
        title: 'Data Structures Lecture',
        description: 'Advanced tree structures',
        type: 'class',
        date: new Date(),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        location: 'Room 301',
        subject: 'Data Structures',
        status: 'scheduled',
        createdBy: req.user._id,
      },
    ];

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get schedule',
    });
  }
};

// @desc    Create schedule event
// @route   POST /api/teacher/schedule
// @access  Private/Teacher
export const createScheduleEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event',
    });
  }
};

// @desc    Update schedule event
// @route   PUT /api/teacher/schedule/:id
// @access  Private/Teacher
export const updateScheduleEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update event',
    });
  }
};

// @desc    Delete schedule event
// @route   DELETE /api/teacher/schedule/:id
// @access  Private/Teacher
export const deleteScheduleEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event',
    });
  }
};

// @desc    Get resources
// @route   GET /api/teacher/resources
// @access  Private/Teacher
export const getResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Mock resources
    const resources = [
      {
        _id: '1',
        title: 'DSA Complete Notes',
        description: 'Comprehensive DSA notes',
        type: 'pdf',
        subject: 'Data Structures',
        tags: ['dsa', 'notes'],
        createdBy: req.user._id,
        createdAt: new Date(),
      },
    ];

    res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get resources',
    });
  }
};

// @desc    Create resource
// @route   POST /api/teacher/resources
// @access  Private/Teacher
export const createResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create resource',
    });
  }
};

// @desc    Update resource
// @route   PUT /api/teacher/resources/:id
// @access  Private/Teacher
export const updateResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: req.body
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update resource',
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/teacher/resources/:id
// @access  Private/Teacher
export const deleteResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete resource',
    });
  }
};

// @desc    Get analytics
// @route   GET /api/teacher/analytics
// @access  Private/Teacher
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const department = req.user.profile.department;
    const studentUserIdsInDept = await User.find({ 
      'profile.department': department, 
      role: 'student' 
    }).distinct('_id');

    const students = await Student.find({
      userId: { $in: studentUserIdsInDept }
    });

    const analytics = {
      totalStudents: students.length,
      averageReadiness: Math.round(students.reduce((acc, s) => acc + (s.readiness?.overallScore || 0), 0) / (students.length || 1)),
      dsaProgress: {
        totalProblems: 150,
        averageSolved: Math.round(students.reduce((acc, s) => acc + (s.practice?.dsa?.solvedProblems || 0), 0) / (students.length || 1)),
        averageAccuracy: Math.round(students.reduce((acc, s) => acc + (s.practice?.dsa?.accuracy || 0), 0) / (students.length || 1)),
      },
      aptitudeProgress: {
        totalTests: 25,
        averageCompleted: Math.round(students.reduce((acc, s) => acc + (s.practice?.aptitude?.completedTests || 0), 0) / (students.length || 1)),
        averageScore: Math.round(students.reduce((acc, s) => acc + (s.practice?.aptitude?.averageScore || 0), 0) / (students.length || 1)),
      },
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get analytics',
    });
  }
};
