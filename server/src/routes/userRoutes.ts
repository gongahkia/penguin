import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, HttpError } from '@/middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw new HttpError('User not found', 404);
  }

  res.json({
    user: req.user.toJSON()
  });
}));

// Update user preferences
router.patch('/preferences',
  [
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('wallpaper').optional().isString(),
    body('soundEnabled').optional().isBoolean(),
    body('animationsEnabled').optional().isBoolean(),
    body('terminalTheme').optional().isString(),
    body('fontSize').optional().isInt({ min: 8, max: 32 })
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid preferences data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    const allowedFields = ['theme', 'wallpaper', 'soundEnabled', 'animationsEnabled', 'terminalTheme', 'fontSize'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[`preferences.${key}`] = req.body[key];
        return obj;
      }, {});

    const updatedUser = await req.user.updateOne(updates, { new: true });

    res.json({
      message: 'Preferences updated successfully',
      preferences: req.user.preferences
    });
  })
);

// Update profile
router.patch('/profile',
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_-]+$/),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid profile data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    const { username, email } = req.body;
    const updates: any = {};

    if (username && username !== req.user.username) {
      const existingUser = await req.user.constructor.findOne({ username });
      if (existingUser) {
        throw new HttpError('Username already taken', 409);
      }
      updates.username = username;
    }

    if (email && email !== req.user.email) {
      const existingUser = await req.user.constructor.findOne({ email });
      if (existingUser) {
        throw new HttpError('Email already taken', 409);
      }
      updates.email = email;
    }

    if (Object.keys(updates).length > 0) {
      await req.user.updateOne(updates);
    }

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON()
    });
  })
);

export default router;