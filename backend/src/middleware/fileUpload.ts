import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', 'text/plain', 'application/x-ipynb+json', 'application/json', 'text/markdown'];

  // Check file extensions for special cases
  const isIpynb = file.originalname.toLowerCase().endsWith('.ipynb');
  const isMarkdown = file.originalname.toLowerCase().endsWith('.md');

  if (allowedTypes.includes(file.mimetype) || isIpynb || isMarkdown) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, documents, zip files, Markdown, and Jupyter notebooks are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});
