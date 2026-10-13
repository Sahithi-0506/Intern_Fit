import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSizeBytes, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    // Check MIME type and file extension
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only standard PDF (.pdf) documents are accepted.'));
    }
  },
});
