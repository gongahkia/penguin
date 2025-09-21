import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, HttpError } from '@/middleware/errorHandler';

const router = express.Router();

// Get user's file system
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw new HttpError('User not found', 404);
  }

  res.json({
    fileSystem: req.user.fileSystem
  });
}));

// Update entire file system
router.put('/',
  [body('fileSystem').notEmpty().withMessage('File system data is required')],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid file system data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    req.user.fileSystem = req.body.fileSystem;
    await req.user.save();

    res.json({
      message: 'File system updated successfully',
      fileSystem: req.user.fileSystem
    });
  })
);

// Create file or directory
router.post('/create',
  [
    body('type').isIn(['file', 'directory']).withMessage('Type must be file or directory'),
    body('path').notEmpty().withMessage('Path is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('content').optional().isString()
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid create data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    const { type, path, name, content = '' } = req.body;

    // Simple file system manipulation (in production, you'd want more sophisticated logic)
    const findNode = (node: any, targetPath: string): any => {
      if (node.path === targetPath) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const parentNode = findNode(req.user.fileSystem, path);
    if (!parentNode || parentNode.type !== 'directory') {
      throw new HttpError('Parent directory not found', 404);
    }

    const newNode = {
      name,
      type,
      path: `${path}/${name}`,
      parentPath: path,
      lastModified: new Date(),
      created: new Date(),
      ...(type === 'file' ? { content, size: content.length } : { children: [] })
    };

    if (!parentNode.children) parentNode.children = [];
    parentNode.children.push(newNode);

    await req.user.save();

    res.json({
      message: `${type} created successfully`,
      node: newNode
    });
  })
);

// Update file content
router.patch('/update',
  [
    body('path').notEmpty().withMessage('Path is required'),
    body('content').isString().withMessage('Content must be a string')
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid update data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    const { path, content } = req.body;

    const findNode = (node: any, targetPath: string): any => {
      if (node.path === targetPath) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const fileNode = findNode(req.user.fileSystem, path);
    if (!fileNode || fileNode.type !== 'file') {
      throw new HttpError('File not found', 404);
    }

    fileNode.content = content;
    fileNode.size = content.length;
    fileNode.lastModified = new Date();

    await req.user.save();

    res.json({
      message: 'File updated successfully',
      node: fileNode
    });
  })
);

// Delete file or directory
router.delete('/',
  [body('path').notEmpty().withMessage('Path is required')],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid delete data', 400);
    }

    if (!req.user) {
      throw new HttpError('User not found', 404);
    }

    const { path } = req.body;

    const deleteNode = (node: any, targetPath: string): boolean => {
      if (node.children) {
        const index = node.children.findIndex((child: any) => child.path === targetPath);
        if (index !== -1) {
          node.children.splice(index, 1);
          return true;
        }
        for (const child of node.children) {
          if (deleteNode(child, targetPath)) return true;
        }
      }
      return false;
    };

    const deleted = deleteNode(req.user.fileSystem, path);
    if (!deleted) {
      throw new HttpError('File or directory not found', 404);
    }

    await req.user.save();

    res.json({
      message: 'Deleted successfully'
    });
  })
);

export default router;