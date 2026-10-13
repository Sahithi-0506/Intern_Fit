import { NotificationItem } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore, EmailOutboxRecord } from './dataStore';
import { v4 as uuidv4 } from 'uuid';

export const notificationRepository = {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'action_required' = 'info',
    link: string | null = null
  ): Promise<NotificationItem> {
    const notif: NotificationItem = {
      id: uuidv4(),
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [notif.id, userId, title, message, type, link]
      );
      return notif;
    }

    memoryStore.notifications.unshift(notif);
    return notif;
  },

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, title, message, type, link, is_read as isRead, created_at as createdAt
         FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );
      return rows;
    }
    return memoryStore.notifications.filter(n => n.userId === userId);
  },

  async markAsRead(id: string, userId: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`, [id, userId]);
      return;
    }
    const n = memoryStore.notifications.find(item => item.id === id && item.userId === userId);
    if (n) n.isRead = true;
  },

  // Outbox Tracking
  async recordOutbox(
    recipientEmail: string,
    subject: string,
    htmlBody: string,
    textBody: string,
    status: 'queued' | 'sending' | 'sent' | 'failed' | 'dry_run_logged',
    error?: string
  ): Promise<void> {
    const id = uuidv4();
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO email_outbox (id, recipient_email, subject, html_body, text_body, status, last_error, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, recipientEmail, subject, htmlBody, textBody, status, error || null, status === 'sent' ? new Date() : null]
      );
      return;
    }
    const record: EmailOutboxRecord = {
      id,
      recipientEmail,
      subject,
      htmlBody,
      textBody,
      status,
      retryCount: 0,
      lastError: error || null,
      sentAt: status === 'sent' ? new Date() : null,
      createdAt: new Date().toISOString(),
    };
    memoryStore.emailOutbox.push(record);
  },

  async getOutboxList(): Promise<EmailOutboxRecord[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, recipient_email as recipientEmail, subject, html_body as htmlBody, text_body as textBody,
                status, retry_count as retryCount, last_error as lastError, sent_at as sentAt, created_at as createdAt
         FROM email_outbox ORDER BY created_at DESC LIMIT 100`
      );
      return rows;
    }
    return [...memoryStore.emailOutbox];
  },
};
