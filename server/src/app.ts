import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config/env';
import { initDatabaseConnection } from './config/db';
import apiRouter from './routes/apiRouter';
import { errorHandler } from './middleware/errorHandler';
import { userRepository } from './repositories/userRepository';

export const app = express();

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

// Bootstrap initial unified Admin / Placement Cell account safely
async function bootstrapDefaultAccounts() {
  const adminEmail = 'admin@internfit.edu';
  const existingAdmin = await userRepository.findByEmail(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await userRepository.create({
      id: 'usr-admin-demo-001',
      email: adminEmail,
      passwordHash,
      firstName: 'Prof. Ramesh',
      lastName: 'Sharma (Placement Cell)',
      role: 'admin_placement_cell',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Bootstrap] Seeded Admin / Placement Cell account: ${adminEmail} (Admin@123)`);
  }
}

export async function startServer() {
  await initDatabaseConnection();
  await bootstrapDefaultAccounts();

  return app.listen(config.port, () => {
    console.log(`\n========================================================================`);
    console.log(`  InternFit Backend API Server is running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Client URL:  ${config.clientUrl}`);
    console.log(`  API Health:  http://localhost:${config.port}/api/health`);
    console.log(`========================================================================\n`);
  });
}

// Start server when executed directly
if (require.main === module) {
  startServer().catch(err => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}
