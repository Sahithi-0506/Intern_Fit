import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'internfit_fallback_secret_for_development_382910398',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'internfit_cookie_signing_secret_92830192830192830',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'internfit_user',
    password: process.env.DB_PASSWORD || 'InternFit_App_Pass_2026!',
    name: process.env.DB_NAME || 'internfit_db',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'InternFit Placement Cell <noreply@internfit.edu>',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads/resumes'),
    maxSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '5242880', 10), // 5MB
  },
};
