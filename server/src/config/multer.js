import multer from 'multer';
import path from 'path';

// Configure storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter - only allow PDF, DOC, DOCX, TXT, MD
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'), false);
  }
};

// Limit file size to 5MB
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;