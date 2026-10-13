import { Application, ApplicationStatus, StudentDashboardStats } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore } from './dataStore';
import { v4 as uuidv4 } from 'uuid';

export const applicationRepository = {
  async recordApplication(
    userId: string,
    internshipId: string,
    externalPlatform: string,
    destinationDomain: string,
    notes?: string
  ): Promise<Application> {
    const existing = await this.getByUserAndInternship(userId, internshipId);
    if (existing) {
      // Idempotent: If already exists, return existing
      return existing;
    }

    const id = uuidv4();
    const appliedAt = new Date().toISOString();

    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO applications (id, user_id, internship_id, status, applied_at, external_platform, notes, destination_domain)
         VALUES (?, ?, ?, 'applied_self_reported', NOW(), ?, ?, ?)`,
        [id, userId, internshipId, externalPlatform, notes || null, destinationDomain]
      );

      await pool.query(
        `INSERT INTO application_status_history (application_id, status, is_self_reported, notes)
         VALUES (?, 'applied_self_reported', TRUE, 'Student recorded external submission')`,
        [id]
      );

      return (await this.getById(id))!;
    }

    const app: Application = {
      id,
      userId,
      internshipId,
      status: 'applied_self_reported',
      appliedAt,
      externalPlatform,
      notes: notes || null,
      destinationDomain,
      createdAt: appliedAt,
      updatedAt: appliedAt,
    };

    memoryStore.applications.set(`${userId}:${internshipId}`, app);
    memoryStore.applicationHistories.push({
      id: memoryStore.applicationHistories.length + 1,
      applicationId: id,
      status: 'applied_self_reported',
      isSelfReported: true,
      notes: 'Student recorded external submission',
      createdAt: appliedAt,
    });

    return app;
  },

  async getByUserAndInternship(userId: string, internshipId: string): Promise<Application | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.user_id as userId, a.internship_id as internshipId, a.status,
                a.applied_at as appliedAt, a.external_platform as externalPlatform,
                a.notes, a.destination_domain as destinationDomain,
                a.created_at as createdAt, a.updated_at as updatedAt
         FROM applications a WHERE a.user_id = ? AND a.internship_id = ? LIMIT 1`,
        [userId, internshipId]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.applications.get(`${userId}:${internshipId}`) || null;
  },

  async getById(id: string): Promise<Application | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.user_id as userId, a.internship_id as internshipId, a.status,
                a.applied_at as appliedAt, a.external_platform as externalPlatform,
                a.notes, a.destination_domain as destinationDomain,
                a.created_at as createdAt, a.updated_at as updatedAt
         FROM applications a WHERE a.id = ? LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    for (const a of memoryStore.applications.values()) {
      if (a.id === id) return a;
    }
    return null;
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.user_id as userId, a.internship_id as internshipId, a.status,
                a.applied_at as appliedAt, a.external_platform as externalPlatform,
                a.notes, a.destination_domain as destinationDomain,
                a.created_at as createdAt, a.updated_at as updatedAt,
                i.title as int_title, i.company_name as int_company, i.location as int_location,
                i.original_application_url as int_url, i.application_deadline as int_deadline,
                i.stipend_amount as int_stipend
         FROM applications a
         JOIN internships i ON a.internship_id = i.id
         WHERE a.user_id = ? ORDER BY a.applied_at DESC`,
        [userId]
      );

      return rows.map(r => ({
        id: r.id,
        userId: r.userId,
        internshipId: r.internshipId,
        status: r.status,
        appliedAt: r.appliedAt,
        externalPlatform: r.externalPlatform,
        notes: r.notes,
        destinationDomain: r.destinationDomain,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        internship: {
          id: r.internshipId,
          companyId: null,
          companyName: r.int_company,
          title: r.int_title,
          description: '',
          responsibilities: null,
          selectionProcess: null,
          location: r.int_location,
          city: '',
          workMode: 'onsite',
          duration: '',
          stipendAmount: r.int_stipend,
          isStipendDisclosed: true,
          category: 'paid_internship',
          startDate: null,
          applicationDeadline: r.int_deadline,
          eligibleDegrees: [],
          eligibleYears: [],
          eligibleBranches: [],
          minCgpa: null,
          allowsBacklogs: false,
          originalApplicationUrl: r.int_url,
          sourceType: 'official_careers_page',
          sourceUrl: r.int_url,
          sourceEvidenceNotes: null,
          listingStatus: 'published',
          verificationStatus: 'placement_cell_verified',
          reviewedByUserId: null,
          reviewedAt: null,
          lastCheckedAt: '',
          createdAt: '',
          updatedAt: '',
        },
      }));
    }

    const apps: Application[] = [];
    for (const [key, app] of memoryStore.applications.entries()) {
      if (key.startsWith(`${userId}:`)) {
        const int = memoryStore.internships.get(app.internshipId);
        apps.push({
          ...app,
          internship: int,
        });
      }
    }
    return apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async updateStatus(applicationId: string, status: ApplicationStatus, notes?: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?`, [status, applicationId]);
      await pool.query(
        `INSERT INTO application_status_history (application_id, status, is_self_reported, notes) VALUES (?, ?, TRUE, ?)`,
        [applicationId, status, notes || `Status updated to ${status}`]
      );
      return;
    }

    for (const app of memoryStore.applications.values()) {
      if (app.id === applicationId) {
        app.status = status;
        app.updatedAt = new Date().toISOString();
        memoryStore.applicationHistories.push({
          id: memoryStore.applicationHistories.length + 1,
          applicationId,
          status,
          isSelfReported: true,
          notes: notes || `Status updated to ${status}`,
          createdAt: new Date().toISOString(),
        });
        break;
      }
    }
  },

  async updateNotes(applicationId: string, notes: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE applications SET notes = ?, updated_at = NOW() WHERE id = ?`, [notes, applicationId]);
      return;
    }
    for (const app of memoryStore.applications.values()) {
      if (app.id === applicationId) {
        app.notes = notes;
        app.updatedAt = new Date().toISOString();
        break;
      }
    }
  },

  async getDashboardStats(userId: string): Promise<StudentDashboardStats> {
    const userApps = await this.getUserApplications(userId);
    const byStatus: Record<string, number> = {
      applied_self_reported: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };

    for (const a of userApps) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    }

    let savedCount = 0;
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(`SELECT COUNT(*) as cnt FROM saved_internships WHERE user_id = ?`, [userId]);
      savedCount = rows[0]?.cnt || 0;
    } else {
      for (const k of memoryStore.savedInternships) {
        if (k.startsWith(`${userId}:`)) savedCount++;
      }
    }

    const totalOpportunities = isMySQLConnected
      ? (await getPool()!.query<any[]>(`SELECT COUNT(*) as cnt FROM internships WHERE listing_status = 'published'`))[0][0]?.cnt || 0
      : Array.from(memoryStore.internships.values()).filter(i => i.listingStatus === 'published').length;

    // Upcoming deadlines from published internships
    const upcomingDeadlines: { id: string; title: string; companyName: string; deadline: string }[] = [];
    const allInternships = Array.from(memoryStore.internships.values())
      .filter(i => i.listingStatus === 'published' && i.applicationDeadline)
      .slice(0, 5);

    for (const i of allInternships) {
      upcomingDeadlines.push({
        id: i.id,
        title: i.title,
        companyName: i.companyName,
        deadline: i.applicationDeadline!,
      });
    }

    return {
      totalOpportunities,
      savedCount,
      appliedCount: userApps.length,
      applicationsByStatus: byStatus,
      upcomingDeadlines,
      recentAnalysesCount: isMySQLConnected ? 0 : memoryStore.resumeAnalyses.size,
      recentRiskChecksCount: isMySQLConnected ? 0 : memoryStore.urlRiskAssessments.size,
    };
  },
};
