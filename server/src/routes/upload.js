import express from 'express';
import upload from '../config/multer.js';
import { uploadResume } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/upload-resume',
  authenticate,
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
        });
      }

      if (!req.userId) {
        return res.status(401).json({
          error: 'User not authenticated',
        });
      }

      const result = await uploadResume(
        req.file.buffer,
        req.userId,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        filename: result.originalName,
      });
    } catch (error) {
      console.error('Upload error:', error);

      res.status(500).json({
        error: error.message || 'Failed to upload resume',
      });
    }
  }
);

export default router;