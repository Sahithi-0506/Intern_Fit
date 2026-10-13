import nodemailer from 'nodemailer';
import { config } from './env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: nodemailer.Transporter | null = null;

if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // false for port 587
    requireTLS: config.smtp.port === 587,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  console.log(`[Email] Configured SMTP transporter for host: ${config.smtp.host}:${config.smtp.port} (secure: ${config.smtp.secure}, requireTLS: ${config.smtp.port === 587})`);
} else {
  console.log(`[Email] Incomplete SMTP credentials (SMTP_PASS is empty in .env). Outbound emails will be logged and saved to email_outbox in dry_run_logged mode.`);
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; status: 'sent' | 'dry_run_logged' | 'failed'; error?: string }> {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return { success: true, status: 'sent' };
    } catch (err: any) {
      console.error(`[Email Delivery Failure] Failed sending to ${options.to}:`, err.message);
      return { success: false, status: 'failed', error: err.message };
    }
  }

  // Dry run / unconfigured mode
  console.log(`\n================== [OUTGOING EMAIL (DRY-RUN LOGGED)] ==================`);
  console.log(`TO: ${options.to}`);
  console.log(`SUBJECT: ${options.subject}`);
  console.log(`BODY:\n${options.text}`);
  console.log(`=======================================================================\n`);
  return { success: true, status: 'dry_run_logged' };
}

export async function verifySmtpConnection(): Promise<{ connected: boolean; status: 'connected' | 'not_configured' | 'failed'; message: string }> {
  if (!transporter) {
    return {
      connected: false,
      status: 'not_configured',
      message: 'SMTP credentials incomplete (SMTP_PASS is empty in server/.env). Operating in safe dry_run_logged mode.',
    };
  }
  try {
    await transporter.verify();
    return {
      connected: true,
      status: 'connected',
      message: `SMTP connection to ${config.smtp.host}:${config.smtp.port} verified successfully with STARTTLS.`,
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'failed',
      message: `SMTP connection to ${config.smtp.host}:${config.smtp.port} failed: ${err.message}`,
    };
  }
}
