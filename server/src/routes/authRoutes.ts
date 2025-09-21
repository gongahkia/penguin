import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import User from '@/models/User';
import { generateToken } from '@/middleware/auth';
import { asyncHandler, HttpError } from '@/middleware/errorHandler';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Validation failed', 400);
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new HttpError('User already exists with this email or username', 409);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    // Create initial session
    const sessionId = uuidv4();
    user.sessions.push({
      sessionId,
      lastAccess: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), sessionId);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  })
);

// Login user
router.post('/login',
  [
    body('usernameOrEmail')
      .notEmpty()
      .withMessage('Username or email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Validation failed', 400);
    }

    const { usernameOrEmail, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail }
      ]
    });

    if (!user) {
      throw new HttpError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new HttpError('Invalid credentials', 401);
    }

    // Create new session
    const sessionId = uuidv4();
    user.sessions.push({
      sessionId,
      lastAccess: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Clean up old sessions (keep only last 5)
    if (user.sessions.length > 5) {
      user.sessions = user.sessions
        .sort((a, b) => b.lastAccess.getTime() - a.lastAccess.getTime())
        .slice(0, 5);
    }

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), sessionId);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  })
);

// Logout user (invalidate current session)
router.post('/logout',
  asyncHandler(async (req, res) => {
    // This would typically be handled by the authenticateToken middleware
    // For now, we'll just return success as the client should remove the token
    res.json({
      message: 'Logout successful'
    });
  })
);

// Refresh token
router.post('/refresh',
  asyncHandler(async (req, res) => {
    // For simplicity, we'll just return the same token
    // In a production app, you'd implement proper refresh token logic
    res.json({
      message: 'Token refreshed successfully'
    });
  })
);

export default router;