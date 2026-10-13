import { Internship, InternshipSkill, ListingStatus } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore } from './dataStore';

export interface InternshipFilters {
  search?: string;
  city?: string;
  workMode?: string;
  category?: string;
  isStipendDisclosed?: boolean;
  minCgpa?: number;
  skill?: string;
  status?: ListingStatus;
  limit?: number;
  offset?: number;
}

export function formatMySqlDateTime(dateVal?: string | Date | null): string | null {
  if (!dateVal) return null;
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export const internshipRepository = {
  async getAll(filters: InternshipFilters = {}, currentUserId?: string): Promise<{ items: Internship[]; total: number }> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      let query = `
        SELECT i.id, i.company_id as companyId, i.company_name as companyName, i.title,
               i.description, i.responsibilities, i.selection_process as selectionProcess,
               i.location, i.city, i.work_mode as workMode, i.duration,
               i.stipend_amount as stipendAmount, i.is_stipend_disclosed as isStipendDisclosed,
               i.category, i.start_date as startDate, i.application_deadline as applicationDeadline,
               i.eligible_degrees as eligibleDegrees, i.eligible_years as eligibleYears,
               i.eligible_branches as eligibleBranches, i.min_cgpa as minCgpa,
               i.allows_backlogs as allowsBacklogs, i.original_application_url as originalApplicationUrl,
               i.source_type as sourceType, i.source_url as sourceUrl,
               i.source_evidence_notes as sourceEvidenceNotes, i.listing_status as listingStatus,
               i.verification_status as verificationStatus, i.reviewed_by_user_id as reviewedByUserId,
               i.reviewed_at as reviewedAt, i.last_checked_at as lastCheckedAt,
               i.created_at as createdAt, i.updated_at as updatedAt
        FROM internships i
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.status) {
        query += ` AND i.listing_status = ?`;
        params.push(filters.status);
      } else {
        query += ` AND i.listing_status = 'published'`;
      }

      if (filters.search) {
        query += ` AND (i.title LIKE ? OR i.company_name LIKE ? OR i.description LIKE ?)`;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
      }

      if (filters.city && filters.city !== 'All') {
        query += ` AND i.city = ?`;
        params.push(filters.city);
      }

      if (filters.workMode && filters.workMode !== 'All') {
        query += ` AND i.work_mode = ?`;
        params.push(filters.workMode);
      }

      if (filters.category && filters.category !== 'All') {
        query += ` AND i.category = ?`;
        params.push(filters.category);
      }

      query += ` ORDER BY i.created_at DESC`;

      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [rows] = await pool.query<any[]>(query, params);

      // Fetch skills for these items
      const items: Internship[] = [];
      for (const row of rows) {
        const [skillRows] = await pool.query<any[]>(
          `SELECT skill_name as skillName, skill_type as skillType FROM internship_skills WHERE internship_id = ?`,
          [row.id]
        );
        let isSaved = false;
        let applicationStatus = null;
        if (currentUserId) {
          const [saved] = await pool.query<any[]>(
            `SELECT id FROM saved_internships WHERE user_id = ? AND internship_id = ? LIMIT 1`,
            [currentUserId, row.id]
          );
          isSaved = saved.length > 0;
          const [apps] = await pool.query<any[]>(
            `SELECT status FROM applications WHERE user_id = ? AND internship_id = ? LIMIT 1`,
            [currentUserId, row.id]
          );
          if (apps.length > 0) applicationStatus = apps[0].status;
        }

        items.push({
          ...row,
          eligibleDegrees: typeof row.eligibleDegrees === 'string' ? JSON.parse(row.eligibleDegrees) : row.eligibleDegrees || [],
          eligibleYears: typeof row.eligibleYears === 'string' ? JSON.parse(row.eligibleYears) : row.eligibleYears || [],
          eligibleBranches: typeof row.eligibleBranches === 'string' ? JSON.parse(row.eligibleBranches) : row.eligibleBranches || [],
          skills: skillRows,
          isSaved,
          applicationStatus,
        });
      }

      return { items, total: items.length };
    }

    // Memory Store implementation
    let all = Array.from(memoryStore.internships.values());

    if (filters.status) {
      all = all.filter(i => i.listingStatus === filters.status);
    } else {
      all = all.filter(i => i.listingStatus === 'published');
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      all = all.filter(
        i =>
          i.title.toLowerCase().includes(s) ||
          i.companyName.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s)
      );
    }

    if (filters.city && filters.city !== 'All') {
      all = all.filter(i => i.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters.workMode && filters.workMode !== 'All') {
      all = all.filter(i => i.workMode === filters.workMode);
    }

    if (filters.category && filters.category !== 'All') {
      all = all.filter(i => i.category === filters.category);
    }

    const total = all.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    const paged = all.slice(offset, offset + limit);

    const items = paged.map(i => {
      let isSaved = false;
      let applicationStatus = null;
      if (currentUserId) {
        isSaved = memoryStore.savedInternships.has(`${currentUserId}:${i.id}`);
        const app = memoryStore.applications.get(`${currentUserId}:${i.id}`);
        if (app) applicationStatus = app.status;
      }
      return {
        ...i,
        isSaved,
        applicationStatus,
      };
    });

    return { items, total };
  },

  async getById(id: string, currentUserId?: string): Promise<Internship | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT i.id, i.company_id as companyId, i.company_name as companyName, i.title,
                i.description, i.responsibilities, i.selection_process as selectionProcess,
                i.location, i.city, i.work_mode as workMode, i.duration,
                i.stipend_amount as stipendAmount, i.is_stipend_disclosed as isStipendDisclosed,
                i.category, i.start_date as startDate, i.application_deadline as applicationDeadline,
                i.eligible_degrees as eligibleDegrees, i.eligible_years as eligibleYears,
                i.eligible_branches as eligibleBranches, i.min_cgpa as minCgpa,
                i.allows_backlogs as allowsBacklogs, i.original_application_url as originalApplicationUrl,
                i.source_type as sourceType, i.source_url as sourceUrl,
                i.source_evidence_notes as sourceEvidenceNotes, i.listing_status as listingStatus,
                i.verification_status as verificationStatus, i.reviewed_by_user_id as reviewedByUserId,
                i.reviewed_at as reviewedAt, i.last_checked_at as lastCheckedAt,
                i.created_at as createdAt, i.updated_at as updatedAt
         FROM internships i WHERE i.id = ? LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      const row = rows[0];

      const [skillRows] = await pool.query<any[]>(
        `SELECT skill_name as skillName, skill_type as skillType FROM internship_skills WHERE internship_id = ?`,
        [id]
      );

      let isSaved = false;
      let applicationStatus = null;
      if (currentUserId) {
        const [saved] = await pool.query<any[]>(
          `SELECT id FROM saved_internships WHERE user_id = ? AND internship_id = ? LIMIT 1`,
          [currentUserId, id]
        );
        isSaved = saved.length > 0;
        const [apps] = await pool.query<any[]>(
          `SELECT status FROM applications WHERE user_id = ? AND internship_id = ? LIMIT 1`,
          [currentUserId, id]
        );
        if (apps.length > 0) applicationStatus = apps[0].status;
      }

      return {
        ...row,
        eligibleDegrees: typeof row.eligibleDegrees === 'string' ? JSON.parse(row.eligibleDegrees) : row.eligibleDegrees || [],
        eligibleYears: typeof row.eligibleYears === 'string' ? JSON.parse(row.eligibleYears) : row.eligibleYears || [],
        eligibleBranches: typeof row.eligibleBranches === 'string' ? JSON.parse(row.eligibleBranches) : row.eligibleBranches || [],
        skills: skillRows,
        isSaved,
        applicationStatus,
      };
    }

    const item = memoryStore.internships.get(id);
    if (!item) return null;

    let isSaved = false;
    let applicationStatus = null;
    if (currentUserId) {
      isSaved = memoryStore.savedInternships.has(`${currentUserId}:${id}`);
      const app = memoryStore.applications.get(`${currentUserId}:${id}`);
      if (app) applicationStatus = app.status;
    }

    return {
      ...item,
      isSaved,
      applicationStatus,
    };
  },

  async create(internship: Internship & { skills?: InternshipSkill[] }): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO internships (
          id, company_name, title, description, responsibilities, selection_process,
          location, city, work_mode, duration, stipend_amount, is_stipend_disclosed,
          category, start_date, application_deadline, eligible_degrees, eligible_years,
          eligible_branches, min_cgpa, allows_backlogs, original_application_url,
          source_type, source_url, source_evidence_notes, listing_status, verification_status,
          reviewed_by_user_id, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          internship.id,
          internship.companyName,
          internship.title,
          internship.description,
          internship.responsibilities || null,
          internship.selectionProcess || null,
          internship.location,
          internship.city,
          internship.workMode,
          internship.duration,
          internship.stipendAmount,
          internship.isStipendDisclosed,
          internship.category,
          formatMySqlDateTime(internship.startDate),
          formatMySqlDateTime(internship.applicationDeadline),
          JSON.stringify(internship.eligibleDegrees || []),
          JSON.stringify(internship.eligibleYears || []),
          JSON.stringify(internship.eligibleBranches || []),
          internship.minCgpa ?? null,
          internship.allowsBacklogs ?? false,
          internship.originalApplicationUrl,
          internship.sourceType,
          internship.sourceUrl,
          internship.sourceEvidenceNotes || null,
          internship.listingStatus,
          internship.verificationStatus,
          internship.reviewedByUserId || null,
        ]
      );

      if (internship.skills && internship.skills.length > 0) {
        for (const skill of internship.skills) {
          await pool.query(
            `INSERT INTO internship_skills (internship_id, skill_name, skill_type) VALUES (?, ?, ?)`,
            [internship.id, skill.skillName, skill.skillType]
          );
        }
      }
      return;
    }

    memoryStore.internships.set(internship.id, {
      ...internship,
      skills: internship.skills || [],
    });
  },

  async updateStatus(id: string, status: ListingStatus): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE internships SET listing_status = ? WHERE id = ?`, [status, id]);
      return;
    }
    const item = memoryStore.internships.get(id);
    if (item) {
      item.listingStatus = status;
      item.updatedAt = new Date().toISOString();
    }
  },

  async updateListing(id: string, updates: Partial<Internship>): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
      if (updates.companyName !== undefined) { fields.push('company_name = ?'); values.push(updates.companyName); }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
      if (updates.responsibilities !== undefined) { fields.push('responsibilities = ?'); values.push(updates.responsibilities || null); }
      if (updates.selectionProcess !== undefined) { fields.push('selection_process = ?'); values.push(updates.selectionProcess || null); }
      if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location); }
      if (updates.city !== undefined) { fields.push('city = ?'); values.push(updates.city); }
      if (updates.workMode !== undefined) { fields.push('work_mode = ?'); values.push(updates.workMode); }
      if (updates.duration !== undefined) { fields.push('duration = ?'); values.push(updates.duration); }
      if (updates.stipendAmount !== undefined) { fields.push('stipend_amount = ?'); values.push(updates.stipendAmount); }
      if (updates.isStipendDisclosed !== undefined) { fields.push('is_stipend_disclosed = ?'); values.push(updates.isStipendDisclosed); }
      if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
      if (updates.startDate !== undefined) { fields.push('start_date = ?'); values.push(formatMySqlDateTime(updates.startDate)); }
      if (updates.applicationDeadline !== undefined) { fields.push('application_deadline = ?'); values.push(formatMySqlDateTime(updates.applicationDeadline)); }
      if (updates.originalApplicationUrl !== undefined) { fields.push('original_application_url = ?'); values.push(updates.originalApplicationUrl); }
      if (updates.listingStatus !== undefined) { fields.push('listing_status = ?'); values.push(updates.listingStatus); }
      if (updates.verificationStatus !== undefined) { fields.push('verification_status = ?'); values.push(updates.verificationStatus); }
      if (updates.eligibleDegrees !== undefined) { fields.push('eligible_degrees = ?'); values.push(JSON.stringify(updates.eligibleDegrees)); }
      if (updates.eligibleYears !== undefined) { fields.push('eligible_years = ?'); values.push(JSON.stringify(updates.eligibleYears)); }
      if (updates.eligibleBranches !== undefined) { fields.push('eligible_branches = ?'); values.push(JSON.stringify(updates.eligibleBranches)); }
      if (updates.minCgpa !== undefined) { fields.push('min_cgpa = ?'); values.push(updates.minCgpa); }
      if (updates.allowsBacklogs !== undefined) { fields.push('allows_backlogs = ?'); values.push(updates.allowsBacklogs); }

      if (fields.length === 0) return;
      fields.push('updated_at = NOW()');
      values.push(id);

      await pool.query(`UPDATE internships SET ${fields.join(', ')} WHERE id = ?`, values);
      return;
    }
    const item = memoryStore.internships.get(id);
    if (item) {
      Object.assign(item, updates);
      item.updatedAt = new Date().toISOString();
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [res] = await pool.query<any>(`DELETE FROM internships WHERE id = ?`, [id]);
      return res.affectedRows > 0;
    }
    return memoryStore.internships.delete(id);
  },

  // Saved Internships
  async saveInternship(userId: string, internshipId: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT IGNORE INTO saved_internships (user_id, internship_id) VALUES (?, ?)`,
        [userId, internshipId]
      );
      return;
    }
    memoryStore.savedInternships.add(`${userId}:${internshipId}`);
  },

  async unsaveInternship(userId: string, internshipId: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`DELETE FROM saved_internships WHERE user_id = ? AND internship_id = ?`, [userId, internshipId]);
      return;
    }
    memoryStore.savedInternships.delete(`${userId}:${internshipId}`);
  },

  async getSavedInternships(userId: string): Promise<Internship[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT i.* FROM internships i
         JOIN saved_internships s ON i.id = s.internship_id
         WHERE s.user_id = ? ORDER BY s.created_at DESC`,
        [userId]
      );
      return rows.map(r => ({
        ...r,
        eligibleDegrees: typeof r.eligible_degrees === 'string' ? JSON.parse(r.eligible_degrees) : r.eligible_degrees || [],
        eligibleYears: typeof r.eligible_years === 'string' ? JSON.parse(r.eligible_years) : r.eligible_years || [],
        eligibleBranches: typeof r.eligible_branches === 'string' ? JSON.parse(r.eligible_branches) : r.eligible_branches || [],
        isSaved: true,
      }));
    }

    const saved: Internship[] = [];
    for (const key of memoryStore.savedInternships) {
      if (key.startsWith(`${userId}:`)) {
        const intId = key.split(':')[1];
        const item = memoryStore.internships.get(intId);
        if (item) saved.push({ ...item, isSaved: true });
      }
    }
    return saved;
  },
};
