import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import SystemSettings from '../models/SystemSettings.model';
import User from '../models/User.model';
import { AuthRequest } from './auth.middleware';

export const maintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await SystemSettings.findOne();
    
    // If maintenance mode is ON
    if (settings?.maintenanceMode) {
      // 1. Check for token in headers to identify admin
      let token: string | undefined;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        try {
          const jwtSecret = process.env.JWT_SECRET || 'placement-platform-secret-key-dev-12345678901234567890';
          const decoded = jwt.verify(token, jwtSecret) as { id: string };
          const user = await User.findById(decoded.id);
          
          if (user && user.role === 'admin') {
            return next(); // Bypass maintenance for admins
          }
        } catch (err) {
          // Token verification failed, proceed with maintenance blockade
        }
      }
      
      // 2. Allow specific status check paths
      const allowPaths = ['/api/auth/login', '/api/admin/settings', '/api/public/settings', '/api/health'];
      if (allowPaths.some(path => req.path.includes(path))) {
        return next();
      }

      return res.status(503).json({
        success: false,
        message: 'System is currently under maintenance. Please try again later.',
        isMaintenance: true
      });
    }

    next();
  } catch (error) {
    next();
  }
};
