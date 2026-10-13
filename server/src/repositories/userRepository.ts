import { User, StudentProfile, AlumniProfile, AlumniAccessRequest } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore, VerificationTokenRecord, AllowedDomainRecord } from './dataStore';

export const userRepository = {
  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const normalized = email.toLowerCase().trim();
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, email, password_hash as passwordHash, first_name as firstName, last_name as lastName,
                role, is_email_verified as isEmailVerified, is_active as isActive,
                created_at as createdAt, updated_at as updatedAt
         FROM users WHERE email = ? LIMIT 1`,
        [normalized]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    for (const u of memoryStore.users.values()) {
      if (u.email.toLowerCase() === normalized) return u;
    }
    return null;
  },

  async findById(id: string): Promise<(User & { passwordHash: string }) | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, email, password_hash as passwordHash, first_name as firstName, last_name as lastName,
                role, is_email_verified as isEmailVerified, is_active as isActive,
                created_at as createdAt, updated_at as updatedAt
         FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.users.get(id) || null;
  },

  async create(user: User & { passwordHash: string }): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_email_verified, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email.toLowerCase().trim(),
          user.passwordHash,
          user.firstName,
          user.lastName,
          user.role,
          user.isEmailVerified,
          user.isActive,
        ]
      );
      return;
    }
    memoryStore.users.set(user.id, { ...user, email: user.email.toLowerCase().trim() });
  },

  async markEmailVerified(userId: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE users SET is_email_verified = TRUE WHERE id = ?`, [userId]);
      return;
    }
    const user = memoryStore.users.get(userId);
    if (user) {
      user.isEmailVerified = true;
      user.updatedAt = new Date().toISOString();
    }
  },

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newPasswordHash, userId]);
      return;
    }
    const user = memoryStore.users.get(userId);
    if (user) {
      user.passwordHash = newPasswordHash;
      user.updatedAt = new Date().toISOString();
    }
  },

  // Allowed Domains Check
  async isEmailDomainAllowed(email: string): Promise<{ isAllowed: boolean; collegeName?: string }> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return { isAllowed: false };

    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT college_name as collegeName FROM allowed_email_domains WHERE domain = ? AND is_active = TRUE LIMIT 1`,
        [domain]
      );
      if (rows.length > 0) {
        return { isAllowed: true, collegeName: rows[0].collegeName };
      }
      return { isAllowed: false };
    }

    const match = memoryStore.allowedDomains.find(d => d.domain.toLowerCase() === domain && d.isActive);
    if (match) {
      return { isAllowed: true, collegeName: match.collegeName };
    }
    return { isAllowed: false };
  },

  async getAllowedDomains(): Promise<AllowedDomainRecord[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, domain, college_name as collegeName, is_active as isActive FROM allowed_email_domains ORDER BY domain ASC`
      );
      return rows;
    }
    return [...memoryStore.allowedDomains];
  },

  async addAllowedDomain(domain: string, collegeName: string): Promise<void> {
    const normDomain = domain.toLowerCase().trim();
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO allowed_email_domains (domain, college_name, is_active) VALUES (?, ?, TRUE)
         ON DUPLICATE KEY UPDATE college_name = VALUES(college_name), is_active = TRUE`,
        [normDomain, collegeName]
      );
      return;
    }
    const existing = memoryStore.allowedDomains.find(d => d.domain === normDomain);
    if (existing) {
      existing.collegeName = collegeName;
      existing.isActive = true;
    } else {
      memoryStore.allowedDomains.push({
        id: memoryStore.allowedDomains.length + 1,
        domain: normDomain,
        collegeName,
        isActive: true,
      });
    }
  },

  // Verification Tokens
  async saveEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [userId, tokenHash, expiresAt]
      );
      return;
    }
    memoryStore.emailTokens.push({
      id: memoryStore.emailTokens.length + 1,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    });
  },

  async verifyEmailToken(tokenHash: string): Promise<{ userId: string } | null> {
    const now = new Date();
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId FROM email_verification_tokens
         WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? LIMIT 1`,
        [tokenHash, now]
      );
      if (rows.length === 0) return null;
      await pool.query(`UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ?`, [rows[0].id]);
      return { userId: rows[0].userId };
    }

    const token = memoryStore.emailTokens.find(
      t => t.tokenHash === tokenHash && t.usedAt === null && t.expiresAt > now
    );
    if (!token) return null;
    token.usedAt = now;
    return { userId: token.userId };
  },

  // Password Reset Tokens
  async savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [userId, tokenHash, expiresAt]
      );
      return;
    }
    memoryStore.passwordResetTokens.push({
      id: memoryStore.passwordResetTokens.length + 1,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    });
  },

  async verifyPasswordResetToken(tokenHash: string): Promise<{ userId: string } | null> {
    const now = new Date();
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId FROM password_reset_tokens
         WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? LIMIT 1`,
        [tokenHash, now]
      );
      if (rows.length === 0) return null;
      await pool.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`, [rows[0].id]);
      return { userId: rows[0].userId };
    }

    const token = memoryStore.passwordResetTokens.find(
      t => t.tokenHash === tokenHash && t.usedAt === null && t.expiresAt > now
    );
    if (!token) return null;
    token.usedAt = now;
    return { userId: token.userId };
  },

  // Student Profiles
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, college_name as collegeName, degree, branch,
                year_of_study as yearOfStudy, graduation_year as graduationYear, cgpa,
                has_active_backlogs as hasActiveBacklogs, bio, linkedin_url as linkedinUrl,
                github_url as githubUrl, created_at as createdAt, updated_at as updatedAt
         FROM student_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.studentProfiles.get(userId) || null;
  },

  async upsertStudentProfile(userId: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO student_profiles (user_id, college_name, degree, branch, year_of_study, graduation_year, cgpa, has_active_backlogs, bio, linkedin_url, github_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           college_name = COALESCE(VALUES(college_name), college_name),
           degree = COALESCE(VALUES(degree), degree),
           branch = COALESCE(VALUES(branch), branch),
           year_of_study = COALESCE(VALUES(year_of_study), year_of_study),
           graduation_year = COALESCE(VALUES(graduation_year), graduation_year),
           cgpa = COALESCE(VALUES(cgpa), cgpa),
           has_active_backlogs = COALESCE(VALUES(has_active_backlogs), has_active_backlogs),
           bio = COALESCE(VALUES(bio), bio),
           linkedin_url = COALESCE(VALUES(linkedin_url), linkedin_url),
           github_url = COALESCE(VALUES(github_url), github_url)`,
        [
          userId,
          profile.collegeName || null,
          profile.degree || null,
          profile.branch || null,
          profile.yearOfStudy ?? null,
          profile.graduationYear ?? null,
          profile.cgpa ?? null,
          profile.hasActiveBacklogs ?? false,
          profile.bio || null,
          profile.linkedinUrl || null,
          profile.githubUrl || null,
        ]
      );
      return (await this.getStudentProfile(userId))!;
    }

    const existing = memoryStore.studentProfiles.get(userId);
    const updated: StudentProfile = {
      id: existing ? existing.id : memoryStore.studentProfiles.size + 1,
      userId,
      collegeName: profile.collegeName !== undefined ? profile.collegeName : existing?.collegeName || null,
      degree: profile.degree !== undefined ? profile.degree : existing?.degree || null,
      branch: profile.branch !== undefined ? profile.branch : existing?.branch || null,
      yearOfStudy: profile.yearOfStudy !== undefined ? profile.yearOfStudy : existing?.yearOfStudy || null,
      graduationYear: profile.graduationYear !== undefined ? profile.graduationYear : existing?.graduationYear || null,
      cgpa: profile.cgpa !== undefined ? profile.cgpa : existing?.cgpa || null,
      hasActiveBacklogs: profile.hasActiveBacklogs !== undefined ? profile.hasActiveBacklogs : existing?.hasActiveBacklogs || false,
      bio: profile.bio !== undefined ? profile.bio : existing?.bio || null,
      linkedinUrl: profile.linkedinUrl !== undefined ? profile.linkedinUrl : existing?.linkedinUrl || null,
      githubUrl: profile.githubUrl !== undefined ? profile.githubUrl : existing?.githubUrl || null,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.studentProfiles.set(userId, updated);
    return updated;
  },

  // Alumni Profiles
  async getAlumniProfile(userId: string): Promise<AlumniProfile | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, graduation_year as graduationYear, degree, branch,
                current_company as currentCompany, current_role as currentRole,
                linkedin_url as linkedinUrl, verification_status as verificationStatus,
                rejection_reason as rejectionReason, is_open_to_mentorship as isOpenToMentorship,
                created_at as createdAt, updated_at as updatedAt
         FROM alumni_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.alumniProfiles.get(userId) || null;
  },

  async upsertAlumniProfile(userId: string, data: Partial<AlumniProfile>): Promise<AlumniProfile> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO alumni_profiles (user_id, graduation_year, degree, branch, current_company, current_role, linkedin_url, verification_status, is_open_to_mentorship)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           graduation_year = VALUES(graduation_year),
           degree = VALUES(degree),
           branch = VALUES(branch),
           current_company = VALUES(current_company),
           current_role = VALUES(current_role),
           linkedin_url = VALUES(linkedin_url),
           verification_status = COALESCE(VALUES(verification_status), verification_status),
           is_open_to_mentorship = VALUES(is_open_to_mentorship)`,
        [
          userId,
          data.graduationYear || 2024,
          data.degree || 'B.Tech',
          data.branch || 'Computer Science',
          data.currentCompany || 'Tech Company',
          data.currentRole || 'Software Engineer',
          data.linkedinUrl || '',
          data.verificationStatus || 'pending',
          data.isOpenToMentorship || false,
        ]
      );
      return (await this.getAlumniProfile(userId))!;
    }

    const existing = memoryStore.alumniProfiles.get(userId);
    const updated: AlumniProfile = {
      id: existing ? existing.id : memoryStore.alumniProfiles.size + 1,
      userId,
      graduationYear: data.graduationYear || existing?.graduationYear || 2024,
      degree: data.degree || existing?.degree || 'B.Tech',
      branch: data.branch || existing?.branch || 'Computer Science',
      currentCompany: data.currentCompany || existing?.currentCompany || 'Tech Company',
      currentRole: data.currentRole || existing?.currentRole || 'Software Engineer',
      linkedinUrl: data.linkedinUrl || existing?.linkedinUrl || '',
      verificationStatus: data.verificationStatus || existing?.verificationStatus || 'pending',
      rejectionReason: data.rejectionReason || existing?.rejectionReason || null,
      isOpenToMentorship: data.isOpenToMentorship !== undefined ? data.isOpenToMentorship : existing?.isOpenToMentorship || false,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.alumniProfiles.set(userId, updated);
    return updated;
  },

  async getAllAlumni(): Promise<(AlumniProfile & { user: User })[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.user_id as userId, a.graduation_year as graduationYear, a.degree, a.branch,
                a.current_company as currentCompany, a.current_role as currentRole,
                a.linkedin_url as linkedinUrl, a.verification_status as verificationStatus,
                a.rejection_reason as rejectionReason, a.is_open_to_mentorship as isOpenToMentorship,
                a.created_at as createdAt, a.updated_at as updatedAt,
                u.email, u.first_name as firstName, u.last_name as lastName, u.role
         FROM alumni_profiles a
         JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC`
      );
      return rows.map(r => ({
        ...r,
        user: {
          id: r.userId,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          role: r.role,
          isEmailVerified: true,
          isActive: true,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
      }));
    }

    const list: (AlumniProfile & { user: User })[] = [];
    for (const [userId, ap] of memoryStore.alumniProfiles.entries()) {
      const u = memoryStore.users.get(userId);
      if (u) {
        list.push({ ...ap, user: u });
      }
    }
    return list;
  },

  // Alumni Access Requests
  async createAlumniAccessRequest(userId: string, requestNote?: string): Promise<AlumniAccessRequest> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [res] = await pool.query<any>(
        `INSERT INTO alumni_access_requests (user_id, request_note, status) VALUES (?, ?, 'pending')`,
        [userId, requestNote || null]
      );
      await pool.query(
        `UPDATE alumni_profiles SET verification_status = 'pending' WHERE user_id = ?`,
        [userId]
      );
      return {
        id: res.insertId,
        userId,
        requestNote: requestNote || null,
        status: 'pending',
        decidedByUserId: null,
        decisionNotes: null,
        decidedAt: null,
        createdAt: new Date().toISOString(),
      };
    }

    const ap = memoryStore.alumniProfiles.get(userId);
    if (ap) {
      ap.verificationStatus = 'pending';
    }
    const reqItem: AlumniAccessRequest = {
      id: Date.now(),
      userId,
      requestNote: requestNote || null,
      status: 'pending',
      decidedByUserId: null,
      decisionNotes: null,
      decidedAt: null,
      createdAt: new Date().toISOString(),
    };
    memoryStore.alumniAccessRequests.push(reqItem);
    return reqItem;
  },

  async getAlumniAccessRequestByUserId(userId: string): Promise<AlumniAccessRequest | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, request_note as requestNote, status,
                decided_by_user_id as decidedByUserId, decision_notes as decisionNotes,
                decided_at as decidedAt, created_at as createdAt
         FROM alumni_access_requests
         WHERE user_id = ?
         ORDER BY id DESC LIMIT 1`,
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    const matching = memoryStore.alumniAccessRequests
      .filter(r => r.userId === userId)
      .sort((a, b) => b.id - a.id);
    return matching[0] || null;
  },

  async getAllAlumniAccessRequests(): Promise<AlumniAccessRequest[]> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT r.id, r.user_id as userId, r.request_note as requestNote, r.status,
                r.decided_by_user_id as decidedByUserId, r.decision_notes as decisionNotes,
                r.decided_at as decidedAt, r.created_at as createdAt,
                u.email, u.first_name as firstName, u.last_name as lastName,
                a.graduation_year as graduationYear, a.degree, a.branch,
                a.current_company as currentCompany, a.current_role as currentRole,
                a.linkedin_url as linkedinUrl, a.verification_status as verificationStatus
         FROM alumni_access_requests r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN alumni_profiles a ON r.user_id = a.user_id
         ORDER BY r.created_at DESC`
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.userId,
        requestNote: r.requestNote,
        status: r.status,
        decidedByUserId: r.decidedByUserId,
        decisionNotes: r.decisionNotes,
        decidedAt: r.decidedAt,
        createdAt: r.createdAt,
        user: {
          id: r.userId,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          role: 'alumni' as const,
          isEmailVerified: true,
          isActive: true,
          createdAt: r.createdAt,
          updatedAt: r.createdAt,
        },
        alumniProfile: r.graduationYear ? {
          id: 0,
          userId: r.userId,
          graduationYear: r.graduationYear,
          degree: r.degree,
          branch: r.branch,
          currentCompany: r.currentCompany,
          currentRole: r.currentRole,
          linkedinUrl: r.linkedinUrl,
          verificationStatus: r.verificationStatus,
          rejectionReason: null,
          isOpenToMentorship: false,
          createdAt: r.createdAt,
          updatedAt: r.createdAt,
        } : undefined,
      }));
    }
    return [...memoryStore.alumniAccessRequests];
  },

  async decideAlumniAccessRequest(
    requestId: number,
    status: 'approved' | 'rejected' | 'revoked',
    decidedByUserId: string,
    decisionNotes?: string
  ): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(`SELECT user_id FROM alumni_access_requests WHERE id = ? LIMIT 1`, [requestId]);
      if (rows.length === 0) return;
      const targetUserId = rows[0].user_id;

      await pool.query(
        `UPDATE alumni_access_requests
         SET status = ?, decided_by_user_id = ?, decision_notes = ?, decided_at = NOW()
         WHERE id = ?`,
        [status, decidedByUserId, decisionNotes || null, requestId]
      );

      await pool.query(
        `UPDATE alumni_profiles
         SET verification_status = ?, rejection_reason = ?, verified_by_user_id = ?, verified_at = NOW()
         WHERE user_id = ?`,
        [status, status === 'rejected' || status === 'revoked' ? (decisionNotes || 'Request not approved') : null, decidedByUserId, targetUserId]
      );
      return;
    }

    const req = memoryStore.alumniAccessRequests.find(r => r.id === requestId);
    const targetUserId = req ? req.userId : Array.from(memoryStore.alumniProfiles.keys())[0];
    if (req) {
      req.status = status;
      req.decidedByUserId = decidedByUserId;
      req.decisionNotes = decisionNotes || null;
      req.decidedAt = new Date().toISOString();
    }
    if (targetUserId) {
      const ap = memoryStore.alumniProfiles.get(targetUserId);
      if (ap) {
        ap.verificationStatus = status;
        ap.rejectionReason = status === 'rejected' || status === 'revoked' ? (decisionNotes || 'Request not approved') : null;
      }
    }
  },

  async revokeAlumniAccess(userId: string, decidedByUserId: string, notes?: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `UPDATE alumni_profiles
         SET verification_status = 'revoked', rejection_reason = ?, verified_by_user_id = ?, verified_at = NOW()
         WHERE user_id = ?`,
        [notes || 'Alumni access revoked by Placement Cell', decidedByUserId, userId]
      );
      await pool.query(
        `INSERT INTO alumni_access_requests (user_id, request_note, status, decided_by_user_id, decision_notes, decided_at)
         VALUES (?, 'Access Revocation Notice', 'revoked', ?, ?, NOW())`,
        [userId, decidedByUserId, notes || 'Access revoked']
      );
      return;
    }
    const ap = memoryStore.alumniProfiles.get(userId);
    if (ap) {
      ap.verificationStatus = 'revoked';
      ap.rejectionReason = notes || 'Access revoked';
    }
    const reqItem: AlumniAccessRequest = {
      id: Date.now(),
      userId,
      requestNote: 'Access Revocation Notice',
      status: 'revoked',
      decidedByUserId,
      decisionNotes: notes || 'Access revoked',
      decidedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    memoryStore.alumniAccessRequests.push(reqItem);
  },

  async approveAlumniAccess(userId: string, decidedByUserId: string, notes?: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `UPDATE alumni_profiles
         SET verification_status = 'approved', rejection_reason = NULL, verified_by_user_id = ?, verified_at = NOW()
         WHERE user_id = ?`,
        [decidedByUserId, userId]
      );
      await pool.query(
        `UPDATE alumni_access_requests
         SET status = 'approved', decided_by_user_id = ?, decision_notes = ?, decided_at = NOW()
         WHERE user_id = ? AND status = 'pending'`,
        [decidedByUserId, notes || 'Access approved via directory', userId]
      );
      return;
    }
    const ap = memoryStore.alumniProfiles.get(userId);
    if (ap) {
      ap.verificationStatus = 'approved';
      ap.rejectionReason = null;
    }
    const pendingReq = memoryStore.alumniAccessRequests.find(r => r.userId === userId && r.status === 'pending');
    if (pendingReq) {
      pendingReq.status = 'approved';
      pendingReq.decidedByUserId = decidedByUserId;
      pendingReq.decisionNotes = notes || 'Access approved via directory';
      pendingReq.decidedAt = new Date().toISOString();
    }
  },
};

