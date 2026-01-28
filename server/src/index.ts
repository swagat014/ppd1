import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import tpoRoutes from './routes/tpo.routes';
import adminRoutes from './routes/admin.routes';
import teacherRoutes from './routes/teacher.routes';
import profileRoutes from './routes/profile.routes';
import coreSubjectRoutes from './routes/coreSubject.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-platform')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Please make sure MongoDB is running or update MONGODB_URI in .env');
    console.error('   The application requires MongoDB to function properly');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/core-subjects', coreSubjectRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Create uploads directories if they don't exist
const uploadDirs = ['uploads/csv', 'uploads/core-subjects'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 ${dir} directory created`);
  }
});

// Store io instance for use in routes
app.set('io', io);

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
