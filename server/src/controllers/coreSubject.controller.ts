import { Request, Response } from 'express';
import CoreSubjectNote from '../models/CoreSubject.model';
import User from '../models/User.model';
import path from 'path';
import fs from 'fs';
import { Types } from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    department?: string;
  };
}

// Get all core subject notes for a specific department
export const getNotesByDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department } = req.params;
    const normalizedDepartment = department.toUpperCase(); // Normalize to uppercase for consistent matching
    const userId = req.user?.id;

    // If user is a student, only show public notes
    // If user is a teacher, show all notes for their department
    let notesQuery: any = { 
      department: { $regex: new RegExp(`^${normalizedDepartment}$`, 'i') }, 
      isPublic: true 
    };
    
    if (req.user?.role === 'teacher') {
      // Teachers can see all notes for their department
      notesQuery = { department: { $regex: new RegExp(`^${normalizedDepartment}$`, 'i') } };
    }

    const notes = await CoreSubjectNote.find(notesQuery)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching core subject notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes',
    });
  }
};

// Get all notes by subject for a department
export const getNotesBySubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, subject } = req.params;
    const normalizedDepartment = department.toUpperCase(); // Normalize to uppercase for consistent matching
    const notesQuery = { 
      department: { $regex: new RegExp(`^${normalizedDepartment}$`, 'i') }, 
      subject,
      isPublic: true 
    };

    const notes = await CoreSubjectNote.find(notesQuery)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching core subject notes by subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes',
    });
  }
};

// Upload a new core subject note
export const uploadNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can upload notes',
      });
    }

    const { title, description, subject, semester, academicYear } = req.body;

    // Validate required fields
    if (!title || !description || !subject || !semester || !academicYear) {
      // Clean up the uploaded file if validation fails
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, description, subject, semester, academicYear',
      });
    }

    // Create the note record
    const newNote = new CoreSubjectNote({
      title,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id,
      department: req.user.department || 'CSE', // Default to CSE if not specified
      subject,
      semester: parseInt(semester),
      academicYear,
      isPublic: true, // By default, notes are public within the department
    });

    await newNote.save();

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: newNote,
    });
  } catch (error) {
    console.error('Error uploading core subject note:', error);
    
    // Clean up the uploaded file if there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading note',
    });
  }
};

// Update a core subject note
export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to update (must be the uploader or an admin)
    const note = await CoreSubjectNote.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (req.user?.role !== 'admin' && req.user?.id !== note.uploadedBy.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note',
      });
    }

    const { title, description, subject, semester, academicYear, isPublic } = req.body;

    // Update the note fields
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (subject) updateData.subject = subject;
    if (semester) updateData.semester = parseInt(semester);
    if (academicYear) updateData.academicYear = academicYear;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedNote = await CoreSubjectNote.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Error updating core subject note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating note',
    });
  }
};

// Delete a core subject note
export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to delete (must be the uploader or an admin)
    const note = await CoreSubjectNote.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (req.user?.role !== 'admin' && req.user?.id !== note.uploadedBy.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note',
      });
    }

    // Delete the physical file
    try {
      fs.unlinkSync(note.filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
      // Continue with deletion even if file deletion fails
    }

    // Delete the document from database
    await CoreSubjectNote.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting core subject note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting note',
    });
  }
};

// Download a core subject note
export const downloadNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await CoreSubjectNote.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check authorization
    if (note.isPublic && req.user?.department !== note.department && req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this note',
      });
    }

    // Check if file exists
    if (!fs.existsSync(note.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Increment download count
    await CoreSubjectNote.findByIdAndUpdate(id, {
      $inc: { downloads: 1 }
    });

    // Set appropriate headers for file download
    res.download(note.filePath, note.fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file',
        });
      }
    });
  } catch (error) {
    console.error('Error downloading core subject note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading note',
    });
  }
};

// Get all subjects for a department
export const getSubjectsByDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department } = req.params;
    const normalizedDepartment = department.toUpperCase(); // Normalize to uppercase for consistent matching

    const subjects = await CoreSubjectNote.distinct('subject', { 
      department: { $regex: new RegExp(`^${normalizedDepartment}$`, 'i') }, 
      isPublic: true 
    });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subjects',
    });
  }
};

// Get notes by semester for a department
export const getNotesBySemester = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, semester } = req.params;
    const normalizedDepartment = department.toUpperCase(); // Normalize to uppercase for consistent matching

    const notes = await CoreSubjectNote.find({ 
      department: { $regex: new RegExp(`^${normalizedDepartment}$`, 'i') }, 
      semester: parseInt(semester),
      isPublic: true 
    })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes by semester:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes',
    });
  }
};