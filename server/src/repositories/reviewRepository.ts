import { AlumniReview, ModerationStatus } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore } from './dataStore';

export const reviewRepository = {
  async getApprovedReviewsForInternship(internshipId: string, companyName?: string): Promise<AlumniReview[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT r.id, r.user_id as userId, r.internship_id as internshipId, r.company_name as companyName,
                r.review_text as reviewText, r.application_advice as applicationAdvice,
                r.work_culture_rating as workCultureRating, r.learning_rating as learningRating,
                r.is_anonymous as isAnonymous, r.moderation_status as moderationStatus,
                r.moderation_notes as moderationNotes, r.created_at as createdAt,
                u.first_name, u.last_name, a.graduation_year as gradYear, a.current_company as curComp, a.current_role as curRole
         FROM alumni_reviews r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN alumni_profiles a ON r.user_id = a.user_id
         WHERE r.moderation_status = 'approved' AND (r.internship_id = ? OR r.company_name = ?)
         ORDER BY r.created_at DESC`,
        [internshipId, companyName || '']
      );

      return rows.map(r => ({
        ...r,
        reviewerName: r.isAnonymous ? 'Verified Alumnus' : `${r.first_name} ${r.last_name}`,
        graduationYear: r.gradYear,
        currentCompany: r.curComp,
        currentRole: r.curRole,
      }));
    }

    const list: AlumniReview[] = [];
    for (const r of memoryStore.reviews.values()) {
      if (
        r.moderationStatus === 'approved' &&
        (r.internshipId === internshipId || (companyName && r.companyName.toLowerCase() === companyName.toLowerCase()))
      ) {
        const u = memoryStore.users.get(r.userId);
        const ap = memoryStore.alumniProfiles.get(r.userId);
        list.push({
          ...r,
          reviewerName: r.isAnonymous ? 'Verified Alumnus' : u ? `${u.firstName} ${u.lastName}` : 'Alumnus',
          graduationYear: ap?.graduationYear,
          currentCompany: ap?.currentCompany,
          currentRole: ap?.currentRole,
        });
      }
    }
    return list;
  },

  async createReview(review: AlumniReview): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO alumni_reviews (id, user_id, internship_id, company_name, review_text, application_advice, work_culture_rating, learning_rating, is_anonymous, moderation_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          review.id,
          review.userId,
          review.internshipId || null,
          review.companyName,
          review.reviewText,
          review.applicationAdvice || null,
          review.workCultureRating || null,
          review.learningRating || null,
          review.isAnonymous,
          review.moderationStatus,
        ]
      );
      return;
    }
    memoryStore.reviews.set(review.id, review);
  },

  async getAllReviewsForAdmin(): Promise<AlumniReview[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT r.id, r.user_id as userId, r.internship_id as internshipId, r.company_name as companyName,
                r.review_text as reviewText, r.application_advice as applicationAdvice,
                r.work_culture_rating as workCultureRating, r.learning_rating as learningRating,
                r.is_anonymous as isAnonymous, r.moderation_status as moderationStatus,
                r.moderation_notes as moderationNotes, r.created_at as createdAt,
                u.first_name, u.last_name, u.email
         FROM alumni_reviews r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC`
      );
      return rows.map(r => ({
        ...r,
        reviewerName: `${r.first_name} ${r.last_name} (${r.email})`,
      }));
    }

    const list: AlumniReview[] = [];
    for (const r of memoryStore.reviews.values()) {
      const u = memoryStore.users.get(r.userId);
      list.push({
        ...r,
        reviewerName: u ? `${u.firstName} ${u.lastName} (${u.email})` : 'Unknown',
      });
    }
    return list;
  },

  async updateModeration(id: string, status: ModerationStatus, notes?: string, adminId?: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `UPDATE alumni_reviews SET moderation_status = ?, moderation_notes = ?, reviewed_by_admin_id = ? WHERE id = ?`,
        [status, notes || null, adminId || null, id]
      );
      return;
    }
    const r = memoryStore.reviews.get(id);
    if (r) {
      r.moderationStatus = status;
      r.moderationNotes = notes || null;
    }
  },

  async getReviewById(id: string): Promise<AlumniReview | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, internship_id as internshipId, company_name as companyName,
                review_text as reviewText, application_advice as applicationAdvice,
                work_culture_rating as workCultureRating, learning_rating as learningRating,
                is_anonymous as isAnonymous, moderation_status as moderationStatus,
                moderation_notes as moderationNotes, created_at as createdAt
         FROM alumni_reviews WHERE id = ? LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.reviews.get(id) || null;
  },

  async getReviewsByUserId(userId: string): Promise<AlumniReview[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT r.id, r.user_id as userId, r.internship_id as internshipId, r.company_name as companyName,
                r.review_text as reviewText, r.application_advice as applicationAdvice,
                r.work_culture_rating as workCultureRating, r.learning_rating as learningRating,
                r.is_anonymous as isAnonymous, r.moderation_status as moderationStatus,
                r.moderation_notes as moderationNotes, r.created_at as createdAt
         FROM alumni_reviews r
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return rows;
    }

    const list: AlumniReview[] = [];
    for (const r of memoryStore.reviews.values()) {
      if (r.userId === userId) {
        list.push(r);
      }
    }
    return list;
  },

  async deletePendingReview(id: string, userId: string): Promise<boolean> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [res] = await pool.query<any>(
        `DELETE FROM alumni_reviews WHERE id = ? AND user_id = ? AND moderation_status = 'pending'`,
        [id, userId]
      );
      return res.affectedRows > 0;
    }
    const r = memoryStore.reviews.get(id);
    if (r && r.userId === userId && r.moderationStatus === 'pending') {
      memoryStore.reviews.delete(id);
      return true;
    }
    return false;
  },

  async updatePendingReview(id: string, userId: string, update: Partial<AlumniReview>): Promise<boolean> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [res] = await pool.query<any>(
        `UPDATE alumni_reviews
         SET review_text = COALESCE(?, review_text),
             application_advice = COALESCE(?, application_advice),
             work_culture_rating = COALESCE(?, work_culture_rating),
             learning_rating = COALESCE(?, learning_rating),
             is_anonymous = COALESCE(?, is_anonymous)
         WHERE id = ? AND user_id = ? AND moderation_status = 'pending'`,
        [
          update.reviewText || null,
          update.applicationAdvice || null,
          update.workCultureRating || null,
          update.learningRating || null,
          update.isAnonymous !== undefined ? update.isAnonymous : null,
          id,
          userId,
        ]
      );
      return res.affectedRows > 0;
    }
    const r = memoryStore.reviews.get(id);
    if (r && r.userId === userId && r.moderationStatus === 'pending') {
      Object.assign(r, update);
      return true;
    }
    return false;
  },
};
