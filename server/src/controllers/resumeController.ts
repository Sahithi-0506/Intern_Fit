import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { StudentResume, ResumeAnalysis } from '@internfit/shared';
import { resumeRepository } from '../repositories/resumeRepository';
import { internshipRepository } from '../repositories/internshipRepository';
import { userRepository } from '../repositories/userRepository';
import { extractSkillsFromText } from '../nlp/skillExtractor';
import { matchSkills } from '../nlp/skillMatcher';
import { evaluateEligibility } from '../nlp/eligibilityEvaluator';

export const resumeController = {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const userId = req.user!.id;

      if (!file) {
        res.status(400).json({ success: false, message: 'Please select a valid PDF file to upload.' });
        return;
      }

      // Read file and parse PDF
      const dataBuffer = fs.readFileSync(file.path);
      let parsedData: any;

      try {
        parsedData = await pdfParse(dataBuffer);
      } catch (err: any) {
        // Remove uploaded file on parse failure
        fs.unlinkSync(file.path);
        res.status(400).json({
          success: false,
          message: `Failed to parse PDF: ${err.message}. Please ensure the file is an uncorrupted PDF document.`,
        });
        return;
      }

      const extractedText = (parsedData.text || '').trim();

      // Check for scanned or unreadable PDF
      if (extractedText.length < 50) {
        fs.unlinkSync(file.path);
        res.status(400).json({
          success: false,
          message:
            'Text extraction unsuccessful: The uploaded PDF appears to be a scanned image or contains no selectable text. ' +
            'Please generate a text-based PDF directly from Word, Google Docs, or LaTeX and upload again.',
        });
        return;
      }

      // Extract skills using rule-based NLP engine
      const extractedSkills = extractSkillsFromText(extractedText);
      const uniqueDetected = Array.from(new Set(extractedSkills.map(s => s.canonicalName)));

      const resumeRecord: StudentResume = {
        id: uuidv4(),
        userId,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        filePath: file.path,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        extractedText,
        detectedSkills: uniqueDetected,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await resumeRepository.saveResume(resumeRecord);

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully!',
        resume: {
          id: resumeRecord.id,
          originalFilename: resumeRecord.originalFilename,
          fileSizeBytes: resumeRecord.fileSizeBytes,
          detectedSkills: resumeRecord.detectedSkills,
          skillsEvidence: extractedSkills,
          textLength: extractedText.length,
          previewSnippet: extractedText.substring(0, 300) + '...',
          updatedAt: resumeRecord.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const resume = await resumeRepository.getResumeByUserId(userId);

      if (!resume) {
        res.json({ success: true, resume: null });
        return;
      }

      const extractedSkills = extractSkillsFromText(resume.extractedText);

      res.json({
        success: true,
        resume: {
          id: resume.id,
          originalFilename: resume.originalFilename,
          fileSizeBytes: resume.fileSizeBytes,
          detectedSkills: resume.detectedSkills,
          skillsEvidence: extractedSkills,
          textLength: resume.extractedText.length,
          previewSnippet: resume.extractedText.substring(0, 300) + '...',
          updatedAt: resume.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const resume = await resumeRepository.getResumeByUserId(userId);

      if (resume) {
        if (fs.existsSync(resume.filePath)) {
          try {
            fs.unlinkSync(resume.filePath);
          } catch (e) {
            console.error('Failed to unlink resume file on disk:', e);
          }
        }
        await resumeRepository.deleteResume(userId);
      }

      res.json({ success: true, message: 'Resume and extracted data have been securely deleted.' });
    } catch (err) {
      next(err);
    }
  },

  async analyzeMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const internshipId = req.params.internshipId as string;
      const userId = req.user!.id;

      // 1. Fetch student's resume
      const resume = await resumeRepository.getResumeByUserId(userId);
      if (!resume) {
        res.status(400).json({
          success: false,
          message: 'No resume found on your profile. Please upload your resume first before running skill matching.',
        });
        return;
      }

      // 2. Fetch internship
      const internship = await internshipRepository.getById(internshipId);
      if (!internship) {
        res.status(404).json({ success: false, message: 'Internship opportunity not found.' });
        return;
      }

      // 3. Separate Required vs Preferred skills
      const allSkills = internship.skills || [];
      const requiredSkills = allSkills.filter(s => s.skillType === 'required').map(s => s.skillName);
      const preferredSkills = allSkills.filter(s => s.skillType === 'preferred').map(s => s.skillName);

      // 4. Run rule-based skill match
      const skillMatch = matchSkills(resume.detectedSkills, requiredSkills, preferredSkills);

      // 5. Fetch student profile & evaluate eligibility independently
      const studentProfile = await userRepository.getStudentProfile(userId);
      const eligibility = evaluateEligibility(
        {
          degree: studentProfile?.degree || null,
          branch: studentProfile?.branch || null,
          yearOfStudy: studentProfile?.yearOfStudy ?? null,
          graduationYear: studentProfile?.graduationYear ?? null,
          cgpa: studentProfile?.cgpa ? Number(studentProfile.cgpa) : null,
          hasActiveBacklogs: studentProfile?.hasActiveBacklogs || false,
        },
        {
          eligibleDegrees: internship.eligibleDegrees || [],
          eligibleYears: internship.eligibleYears || [],
          eligibleBranches: internship.eligibleBranches || [],
          minCgpa: internship.minCgpa ? Number(internship.minCgpa) : null,
          allowsBacklogs: internship.allowsBacklogs,
        }
      );

      // 6. Save analysis
      const analysisRecord: ResumeAnalysis = {
        id: uuidv4(),
        resumeId: resume.id,
        internshipId,
        userId,
        matchedSkills: skillMatch.matchedSkills,
        missingSkills: skillMatch.missingSkills,
        preferredMatchedSkills: skillMatch.preferredMatchedSkills,
        uncertainSkills: skillMatch.uncertainSkills,
        skillCoveragePercentage: skillMatch.skillCoveragePercentage,
        eligibilityOverall: eligibility.overallResult,
        eligibilityBreakdown: eligibility.breakdown,
        learningRecommendations: skillMatch.learningRecommendations,
        createdAt: new Date().toISOString(),
      };

      await resumeRepository.saveAnalysis(analysisRecord);

      res.json({
        success: true,
        analysis: analysisRecord,
        internshipTitle: internship.title,
        companyName: internship.companyName,
        formulaExplanation:
          requiredSkills.length > 0
            ? `Coverage calculated as: (${skillMatch.matchedSkills.length} matched required skills / ${requiredSkills.length} total required) × 100 = ${skillMatch.skillCoveragePercentage}%`
            : 'No explicit required skills were mandated by employer (100% baseline).',
      });
    } catch (err) {
      next(err);
    }
  },
};
