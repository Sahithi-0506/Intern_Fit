import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateStudentProfileSchema,
} from '@internfit/shared';
import { userRepository } from '../repositories/userRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { sendEmail } from '../config/email';
import { config } from '../config/env';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      // 1. Verify college email domain
      const domainCheck = await userRepository.isEmailDomainAllowed(email);
      if (!domainCheck.isAllowed) {
        res.status(400).json({
          success: false,
          message:
            'Registration restricted: Your email domain is not in the approved college domain allowlist. ' +
            'Please register with your official institute email (e.g., student@internfit.edu, @nitt.edu, @iitb.ac.in).',
        });
        return;
      }

      // 2. Check if user already exists
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'An account with this email address is already registered. Please sign in or reset your password.',
        });
        return;
      }

      // 3. Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);
      const userId = uuidv4();

      const newUser = {
        id: userId,
        email,
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userRepository.create(newUser);

      // Create profile based on role
      if (data.role === 'alumni') {
        await userRepository.upsertAlumniProfile(userId, {
          graduationYear: data.alumniInfo?.graduationYear || new Date().getFullYear(),
          degree: data.alumniInfo?.degree || 'B.Tech',
          branch: data.alumniInfo?.branch || 'Engineering',
          currentCompany: data.alumniInfo?.currentCompany || 'Industry Professional',
          currentRole: data.alumniInfo?.currentRole || 'Alumnus',
          linkedinUrl: data.alumniInfo?.linkedinUrl || '',
          isOpenToMentorship: data.alumniInfo?.isOpenToMentorship ?? false,
          verificationStatus: 'pending',
        });
        // Automatically create an alumni access request so they appear for Admin approval
        await userRepository.createAlumniAccessRequest(
          userId,
          data.alumniInfo?.currentCompany
            ? `Registration access request (${data.alumniInfo.currentRole || 'Alumnus'} at ${data.alumniInfo.currentCompany})`
            : 'Initial alumni access request upon registration'
        );
      } else {
        await userRepository.upsertStudentProfile(userId, {
          collegeName: domainCheck.collegeName || 'Engineering Campus',
        });
      }

      // 4. Generate cryptographically secure verification token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await userRepository.saveEmailVerificationToken(userId, tokenHash, expiresAt);

      // 5. Send verification email
      const verifyUrl = `${config.clientUrl}/verify-email?token=${rawToken}`;
      const emailContent = {
        to: email,
        subject: 'Verify your InternFit College Account',
        text: `Welcome to InternFit, ${data.firstName}!\n\nPlease verify your college email address by opening this link within 1 hour:\n${verifyUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f766e;">Welcome to InternFit</h2>
            <p>Hi ${data.firstName},</p>
            <p>Thank you for creating an account with your verified college email (<strong>${email}</strong>).</p>
            <p>Please click the button below to verify your email address. This link is valid for 1 hour:</p>
            <div style="margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
          </div>
        `,
      };

      const emailResult = await sendEmail(emailContent);
      await notificationRepository.recordOutbox(
        email,
        emailContent.subject,
        emailContent.html,
        emailContent.text,
        emailResult.status,
        emailResult.error
      );

      res.status(201).json({
        success: true,
        message:
          'Account created successfully! We have sent a verification link to your college email address. ' +
          (emailResult.status === 'dry_run_logged' ? '(Dry-run mode active: token logged to console)' : ''),
        userId,
        verificationToken: config.nodeEnv === 'development' ? rawToken : undefined,
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

      const match = await userRepository.verifyEmailToken(tokenHash);
      if (!match) {
        res.status(400).json({
          success: false,
          message: 'Invalid, already used, or expired verification token. Please request a new verification email.',
        });
        return;
      }

      await userRepository.markEmailVerified(match.userId);

      // Create welcome notification
      await notificationRepository.createNotification(
        match.userId,
        'Email Verified Successfully',
        'Your college email has been verified. You now have full access to search verified internships and check risk.',
        'success',
        '/opportunities'
      );

      res.json({
        success: true,
        message: 'Your college email address has been successfully verified! You may now sign in.',
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();

      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact the administrator.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      // Check alumni verification status if applicable
      let alumniStatus = null;
      if (user.role === 'alumni') {
        const ap = await userRepository.getAlumniProfile(user.id);
        alumniStatus = ap?.verificationStatus || 'pending';
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      // Set HTTP-only Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          alumniStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({ success: true, message: 'Signed out successfully.' });
  },

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      let studentProfile = null;
      let alumniProfile = null;

      if (user.role === 'student') {
        studentProfile = await userRepository.getStudentProfile(userId);
      } else if (user.role === 'alumni') {
        alumniProfile = await userRepository.getAlumniProfile(userId);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        studentProfile,
        alumniProfile,
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await userRepository.findByEmail(email.toLowerCase().trim());

      // Prevent account enumeration: return success message regardless of existence
      if (!user) {
        res.json({
          success: true,
          message: 'If an account exists with this email address, a password reset link has been sent.',
        });
        return;
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await userRepository.savePasswordResetToken(user.id, tokenHash, expiresAt);

      const resetUrl = `${config.clientUrl}/reset-password?token=${rawToken}`;
      const emailContent = {
        to: user.email,
        subject: 'Reset your InternFit Password',
        text: `Hi ${user.firstName},\n\nYou requested a password reset for your InternFit account. Open this link within 1 hour:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f766e;">InternFit Password Reset</h2>
            <p>Hi ${user.firstName},</p>
            <p>You recently requested to reset your password. Click the button below to choose a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">This link will expire in 1 hour.<br/><a href="${resetUrl}">${resetUrl}</a></p>
          </div>
        `,
      };

      const emailResult = await sendEmail(emailContent);
      await notificationRepository.recordOutbox(
        user.email,
        emailContent.subject,
        emailContent.html,
        emailContent.text,
        emailResult.status,
        emailResult.error
      );

      res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been sent.',
        resetToken: config.nodeEnv === 'development' ? rawToken : undefined,
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

      const match = await userRepository.verifyPasswordResetToken(tokenHash);
      if (!match) {
        res.status(400).json({
          success: false,
          message: 'Invalid, expired, or already used reset link. Please request a new password reset.',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await userRepository.updatePassword(match.userId, passwordHash);

      await notificationRepository.createNotification(
        match.userId,
        'Password Changed',
        'Your InternFit password was successfully updated.',
        'info'
      );

      res.json({
        success: true,
        message: 'Your password has been reset successfully. You may now sign in with your new password.',
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateStudentProfileSchema.parse(req.body);
      const userId = req.user!.id;

      const updated = await userRepository.upsertStudentProfile(userId, data);
      res.json({
        success: true,
        message: 'Profile updated successfully.',
        profile: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
