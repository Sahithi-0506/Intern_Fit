import { Request, Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/notificationRepository';

export const notificationController = {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const items = await notificationRepository.getUserNotifications(userId);
      res.json({ success: true, items });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      await notificationRepository.markAsRead(id, userId);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err) {
      next(err);
    }
  },
};
