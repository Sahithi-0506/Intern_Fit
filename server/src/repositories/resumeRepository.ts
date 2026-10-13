import { StudentResume, ResumeAnalysis } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore } from './dataStore';

export const resumeRepository = {
  async saveResume(resume: StudentResume): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO student_resumes (id, user_id, original_filename, stored_filename, file_path, file_size_bytes, mime_type, extracted_text, detected_skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           original_filename = VALUES(original_filename),
           stored_filename = VALUES(stored_filename),
           file_path = VALUES(file_path),
           file_size_bytes = VALUES(file_size_bytes),
           mime_type = VALUES(mime_type),
           extracted_text = VALUES(extracted_text),
           detected_skills = VALUES(detected_skills)`,
        [
          resume.id,
          resume.userId,
          resume.originalFilename,
          resume.storedFilename,
          resume.filePath,
          resume.fileSizeBytes,
          resume.mimeType,
          resume.extractedText,
          JSON.stringify(resume.detectedSkills),
        ]
      );
      return;
    }
    memoryStore.resumes.set(resume.userId, resume);
  },

  async getResumeByUserId(userId: string): Promise<StudentResume | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, user_id as userId, original_filename as originalFilename,
                stored_filename as storedFilename, file_path as filePath,
                file_size_bytes as fileSizeBytes, mime_type as mimeType,
                extracted_text as extractedText, detected_skills as detectedSkills,
                created_at as createdAt, updated_at as updatedAt
         FROM student_resumes WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        ...r,
        detectedSkills: typeof r.detectedSkills === 'string' ? JSON.parse(r.detectedSkills) : r.detectedSkills || [],
      };
    }
    return memoryStore.resumes.get(userId) || null;
  },

  async deleteResume(userId: string): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(`DELETE FROM student_resumes WHERE user_id = ?`, [userId]);
      return;
    }
    memoryStore.resumes.delete(userId);
  },

  async saveAnalysis(analysis: ResumeAnalysis): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO resume_analyses (
          id, resume_id, internship_id, user_id, matched_skills, missing_skills,
          preferred_matched_skills, uncertain_skills, skill_coverage_percentage,
          eligibility_overall, eligibility_breakdown, learning_recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          matched_skills = VALUES(matched_skills),
          missing_skills = VALUES(missing_skills),
          preferred_matched_skills = VALUES(preferred_matched_skills),
          uncertain_skills = VALUES(uncertain_skills),
          skill_coverage_percentage = VALUES(skill_coverage_percentage),
          eligibility_overall = VALUES(eligibility_overall),
          eligibility_breakdown = VALUES(eligibility_breakdown),
          learning_recommendations = VALUES(learning_recommendations)`,
        [
          analysis.id,
          analysis.resumeId,
          analysis.internshipId,
          analysis.userId,
          JSON.stringify(analysis.matchedSkills),
          JSON.stringify(analysis.missingSkills),
          JSON.stringify(analysis.preferredMatchedSkills),
          JSON.stringify(analysis.uncertainSkills),
          analysis.skillCoveragePercentage,
          analysis.eligibilityOverall,
          JSON.stringify(analysis.eligibilityBreakdown),
          JSON.stringify(analysis.learningRecommendations),
        ]
      );
      return;
    }
    memoryStore.resumeAnalyses.set(`${analysis.userId}:${analysis.internshipId}`, analysis);
  },

  async getAnalysis(userId: string, internshipId: string): Promise<ResumeAnalysis | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, resume_id as resumeId, internship_id as internshipId, user_id as userId,
                matched_skills as matchedSkills, missing_skills as missingSkills,
                preferred_matched_skills as preferredMatchedSkills, uncertain_skills as uncertainSkills,
                skill_coverage_percentage as skillCoveragePercentage,
                eligibility_overall as eligibilityOverall, eligibility_breakdown as eligibilityBreakdown,
                learning_recommendations as learningRecommendations, created_at as createdAt
         FROM resume_analyses WHERE user_id = ? AND internship_id = ? LIMIT 1`,
        [userId, internshipId]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        ...r,
        matchedSkills: typeof r.matchedSkills === 'string' ? JSON.parse(r.matchedSkills) : r.matchedSkills,
        missingSkills: typeof r.missingSkills === 'string' ? JSON.parse(r.missingSkills) : r.missingSkills,
        preferredMatchedSkills: typeof r.preferredMatchedSkills === 'string' ? JSON.parse(r.preferredMatchedSkills) : r.preferredMatchedSkills,
        uncertainSkills: typeof r.uncertainSkills === 'string' ? JSON.parse(r.uncertainSkills) : r.uncertainSkills,
        eligibilityBreakdown: typeof r.eligibilityBreakdown === 'string' ? JSON.parse(r.eligibilityBreakdown) : r.eligibilityBreakdown,
        learningRecommendations: typeof r.learningRecommendations === 'string' ? JSON.parse(r.learningRecommendations) : r.learningRecommendations,
      };
    }
    return memoryStore.resumeAnalyses.get(`${userId}:${internshipId}`) || null;
  },
};
