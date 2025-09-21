import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'No token provided in Authorization header'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'JWT secret not configured'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string; sessionId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Check if session is still valid
    const validSession = user.sessions.find(session =>
      session.sessionId === decoded.sessionId &&
      session.lastAccess > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
    );

    if (!validSession) {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Please log in again'
      });
    }

    // Update last access time
    validSession.lastAccess = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

export const generateToken = (userId: string, sessionId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign(
    { userId, sessionId },
    jwtSecret,
    { expiresIn: '24h' }
  );
};