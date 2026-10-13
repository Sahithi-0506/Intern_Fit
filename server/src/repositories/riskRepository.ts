import { UrlRiskAssessment } from '@internfit/shared';
import { isMySQLConnected, getPool } from '../config/db';
import { memoryStore } from './dataStore';

export const riskRepository = {
  async saveAssessment(assessment: UrlRiskAssessment): Promise<void> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      await pool.query(
        `INSERT INTO url_risk_assessments (
          id, submitted_url, normalized_url, destination_domain, final_destination_url,
          risk_level, evidence_score, warning_signs, positive_indicators,
          official_source_evidence, missing_evidence_notes, is_reviewed_by_placement_cell,
          recommendations, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assessment.id,
          assessment.submittedUrl,
          assessment.normalizedUrl,
          assessment.destinationDomain,
          assessment.finalDestinationUrl || null,
          assessment.riskLevel,
          assessment.evidenceScore,
          JSON.stringify(assessment.warningSigns),
          JSON.stringify(assessment.positiveIndicators),
          assessment.officialSourceEvidence || null,
          assessment.missingEvidenceNotes || null,
          assessment.isReviewedByPlacementCell,
          JSON.stringify(assessment.recommendations),
          assessment.userId || null,
        ]
      );
      return;
    }
    memoryStore.urlRiskAssessments.set(assessment.id, assessment);
  },

  async getById(id: string): Promise<UrlRiskAssessment | null> {
    if (isMySQLConnected) {
      const pool = getPool()!;
      const [rows] = await pool.query<any[]>(
        `SELECT id, submitted_url as submittedUrl, normalized_url as normalizedUrl,
                destination_domain as destinationDomain, final_destination_url as finalDestinationUrl,
                risk_level as riskLevel, evidence_score as evidenceScore,
                warning_signs as warningSigns, positive_indicators as positiveIndicators,
                official_source_evidence as officialSourceEvidence, missing_evidence_notes as missingEvidenceNotes,
                is_reviewed_by_placement_cell as isReviewedByPlacementCell,
                recommendations, user_id as userId, created_at as createdAt
         FROM url_risk_assessments WHERE id = ? LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        ...r,
        warningSigns: typeof r.warningSigns === 'string' ? JSON.parse(r.warningSigns) : r.warningSigns,
        positiveIndicators: typeof r.positiveIndicators === 'string' ? JSON.parse(r.positiveIndicators) : r.positiveIndicators,
        recommendations: typeof r.recommendations === 'string' ? JSON.parse(r.recommendations) : r.recommendations,
      };
    }
    return memoryStore.urlRiskAssessments.get(id) || null;
  },
};
