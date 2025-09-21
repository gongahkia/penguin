import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('Server configuration error'));
      }

      const decoded = jwt.verify(token, jwtSecret) as { userId: string; sessionId: string };
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected via Socket.IO`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle terminal commands (real-time execution)
    socket.on('terminal:command', async (data) => {
      try {
        const { command, instanceId } = data;
        
        // For demo purposes, just echo back the command
        // In a real implementation, you'd execute the command safely
        const result = {
          instanceId,
          output: `Executed: ${command}`,
          timestamp: new Date().toISOString()
        };

        socket.emit('terminal:output', result);
      } catch (error) {
        socket.emit('terminal:error', {
          message: 'Command execution failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle file system changes (real-time sync)
    socket.on('filesystem:change', async (data) => {
      try {
        if (!socket.userId) return;

        const user = await User.findById(socket.userId);
        if (!user) return;

        // Update user's file system
        user.fileSystem = data.fileSystem;
        await user.save();

        // Broadcast to other sessions of the same user
        socket.to(`user:${socket.userId}`).emit('filesystem:updated', {
          fileSystem: data.fileSystem,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('filesystem:error', {
          message: 'File system sync failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle system notifications
    socket.on('system:notify', (data) => {
      if (socket.userId) {
        // Broadcast notification to all sessions of the user
        io.to(`user:${socket.userId}`).emit('system:notification', {
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from Socket.IO`);
    });
  });
};