import { z } from 'zod';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const USER_ROLES = ['student', 'alumni', 'admin_placement_cell'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const WORK_MODES = ['onsite', 'hybrid', 'remote', 'unknown'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const OPPORTUNITY_CATEGORIES = [
  'paid_internship',
  'unpaid_internship',
  'hiring_challenge',
  'coding_competition',
  'prize_only',
  'learning_opportunity',
] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export const LISTING_STATUSES = [
  'draft',
  'pending_review',
  'published',
  'expired',
  'closed',
  'rejected',
  'archived',
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  'unverified',
  'placement_cell_verified',
  'third_party_verified',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'saved',
  'applied_self_reported',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const RISK_LEVELS = [
  'lower_risk',
  'moderate_risk',
  'high_risk',
  'insufficient_evidence',
] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const ELIGIBILITY_RESULTS = ['eligible', 'ineligible', 'unable_to_determine'] as const;
export type EligibilityResult = (typeof ELIGIBILITY_RESULTS)[number];

export const ALUMNI_VERIFICATION_STATUSES = ['not_requested', 'pending', 'approved', 'rejected', 'revoked'] as const;
export type AlumniVerificationStatus = (typeof ALUMNI_VERIFICATION_STATUSES)[number];

export const MODERATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const SOURCE_TYPES = [
  'official_careers_page',
  'placement_cell_notice',
  'authorized_ats',
  'verified_recruiter_portal',
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const INDIA_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Chennai',
  'Delhi NCR',
  'Gurgaon',
  'Noida',
  'Kolkata',
  'Ahmedabad',
  'Remote',
] as const;

// ============================================================================
// DATA MODELS / INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: number;
  userId: string;
  collegeName: string | null;
  degree: string | null;
  branch: string | null;
  yearOfStudy: number | null;
  graduationYear: number | null;
  cgpa: number | null;
  hasActiveBacklogs: boolean;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniProfile {
  id: number;
  userId: string;
  graduationYear: number;
  degree: string;
  branch: string;
  currentCompany: string;
  currentRole: string;
  linkedinUrl: string;
  verificationStatus: AlumniVerificationStatus;
  rejectionReason: string | null;
  isOpenToMentorship: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniAccessRequest {
  id: number;
  userId: string;
  requestNote: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  decidedByUserId: string | null;
  decisionNotes: string | null;
  decidedAt: string | null;
  createdAt: string;
  user?: User;
  alumniProfile?: AlumniProfile;
}

export interface Company {
  id: number;
  name: string;
  officialWebsiteUrl: string;
  careersPageUrl: string | null;
  domain: string;
  logoUrl: string | null;
  isKnownRecruiter: boolean;
}

export interface InternshipSkill {
  id?: number;
  internshipId: string;
  skillName: string;
  skillType: 'required' | 'preferred';
}

export interface Internship {
  id: string;
  companyId: number | null;
  companyName: string;
  title: string;
  description: string;
  responsibilities: string | null;
  selectionProcess: string | null;
  location: string;
  city: string;
  workMode: WorkMode;
  duration: string;
  stipendAmount: string;
  isStipendDisclosed: boolean;
  category: OpportunityCategory;
  startDate: string | null;
  applicationDeadline: string | null;
  eligibleDegrees: string[];
  eligibleYears: number[];
  eligibleBranches: string[];
  minCgpa: number | null;
  allowsBacklogs: boolean;
  originalApplicationUrl: string;
  sourceType: SourceType;
  sourceUrl: string;
  sourceEvidenceNotes: string | null;
  listingStatus: ListingStatus;
  verificationStatus: VerificationStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
  skills?: InternshipSkill[];
  isSaved?: boolean;
  applicationStatus?: ApplicationStatus | null;
  skillMatchPercentage?: number | null;
  eligibilityStatus?: EligibilityResult;
}

export interface Application {
  id: string;
  userId: string;
  internshipId: string;
  status: ApplicationStatus;
  appliedAt: string;
  externalPlatform: string;
  notes: string | null;
  destinationDomain: string;
  createdAt: string;
  updatedAt: string;
  internship?: Internship;
}

export interface ApplicationHistory {
  id: number;
  applicationId: string;
  status: string;
  isSelfReported: boolean;
  notes: string | null;
  createdAt: string;
}

export interface UrlRiskAssessment {
  id: string;
  submittedUrl: string;
  normalizedUrl: string;
  destinationDomain: string;
  finalDestinationUrl: string | null;
  riskLevel: RiskLevel;
  evidenceScore: number; // 0 to 100
  warningSigns: string[];
  positiveIndicators: string[];
  officialSourceEvidence: string | null;
  missingEvidenceNotes: string | null;
  isReviewedByPlacementCell: boolean;
  recommendations: string[];
  userId: string | null;
  createdAt: string;
}

export interface StudentResume {
  id: string;
  userId: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  extractedText: string;
  detectedSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCriterionBreakdown {
  criterion: 'degree' | 'year' | 'branch' | 'cgpa' | 'backlogs';
  label: string;
  studentValue: string | number | boolean | null;
  requiredValue: string | number | boolean | null;
  status: EligibilityResult;
  reason: string;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  internshipId: string;
  userId: string;
  matchedSkills: string[];
  missingSkills: string[];
  preferredMatchedSkills: string[];
  uncertainSkills: string[];
  skillCoveragePercentage: number;
  eligibilityOverall: EligibilityResult;
  eligibilityBreakdown: EligibilityCriterionBreakdown[];
  learningRecommendations: string[];
  createdAt: string;
}

export interface AlumniReview {
  id: string;
  userId: string;
  internshipId: string | null;
  companyName: string;
  reviewText: string;
  applicationAdvice: string | null;
  workCultureRating: number | null;
  learningRating: number | null;
  isAnonymous: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes: string | null;
  reviewerName?: string;
  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StudentDashboardStats {
  totalOpportunities: number;
  savedCount: number;
  appliedCount: number;
  applicationsByStatus: Record<string, number>;
  upcomingDeadlines: {
    id: string;
    title: string;
    companyName: string;
    deadline: string;
  }[];
  recentAnalysesCount: number;
  recentRiskChecksCount: number;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['student', 'alumni']).default('student'),
  // Additional info for alumni
  alumniInfo: z
    .object({
      graduationYear: z.number().int().min(1980).max(2035),
      degree: z.string().min(1),
      branch: z.string().min(1),
      currentCompany: z.string().min(1),
      currentRole: z.string().min(1),
      linkedinUrl: z.string().url('Must be a valid LinkedIn URL'),
      isOpenToMentorship: z.boolean().default(false),
    })
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateStudentProfileSchema = z.object({
  collegeName: z.string().max(255).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  hasActiveBacklogs: z.boolean().optional(),
  bio: z.string().max(1000).optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;

export const checkUrlRiskSchema = z.object({
  url: z.string().url('Please enter a valid http or https URL'),
});

export type CheckUrlRiskInput = z.infer<typeof checkUrlRiskSchema>;

export const createInternshipSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  title: z.string().min(1, 'Opportunity title is required').max(255),
  description: z.string().min(10, 'Full description must be at least 10 characters'),
  responsibilities: z.string().optional(),
  selectionProcess: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  city: z.string().min(1, 'City is required'),
  workMode: z.enum(WORK_MODES).default('onsite'),
  duration: z.string().min(1, 'Duration is required'),
  stipendAmount: z.string().default('Not disclosed'),
  isStipendDisclosed: z.boolean().default(true),
  category: z.enum(OPPORTUNITY_CATEGORIES).default('paid_internship'),
  startDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  eligibleDegrees: z.array(z.string()).default([]),
  eligibleYears: z.array(z.number()).default([]),
  eligibleBranches: z.array(z.string()).default([]),
  minCgpa: z.number().min(0).max(10).nullable().optional(),
  allowsBacklogs: z.boolean().default(false),
  originalApplicationUrl: z.string().url('Must be a valid URL'),
  sourceType: z.enum(SOURCE_TYPES).default('official_careers_page'),
  sourceUrl: z.string().url('Must be a valid source URL'),
  sourceEvidenceNotes: z.string().optional(),
  listingStatus: z.enum(LISTING_STATUSES).default('published'),
  verificationStatus: z.enum(VERIFICATION_STATUSES).default('placement_cell_verified'),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;

export const recordApplicationSchema = z.object({
  internshipId: z.string().min(1, 'Internship ID is required'),
  externalPlatform: z.string().min(1, 'External platform is required').max(100),
  appliedAt: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type RecordApplicationInput = z.infer<typeof recordApplicationSchema>;

export const updateApplicationNotesSchema = z.object({
  notes: z.string().max(1000),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  notes: z.string().max(1000).optional(),
});

export const createReviewSchema = z.object({
  internshipId: z.string().nullable().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  reviewText: z.string().min(20, 'Review text must be at least 20 characters'),
  applicationAdvice: z.string().max(1000).optional(),
  workCultureRating: z.number().int().min(1).max(5).optional(),
  learningRating: z.number().int().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reportItemSchema = z.object({
  targetType: z.enum(['internship', 'url', 'review']),
  targetId: z.string().min(1),
  reason: z.string().min(3),
  details: z.string().min(10),
});

export type ReportItemInput = z.infer<typeof reportItemSchema>;

export const requestAlumniAccessSchema = z.object({
  requestNote: z.string().max(1000).optional(),
});
export type RequestAlumniAccessInput = z.infer<typeof requestAlumniAccessSchema>;

export const moderateAlumniRequestSchema = z.object({
  status: z.enum(['approved', 'rejected', 'revoked']),
  decisionNotes: z.string().max(1000).optional(),
});
export type ModerateAlumniRequestInput = z.infer<typeof moderateAlumniRequestSchema>;

export const moderateReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  moderationNotes: z.string().max(1000).optional(),
});
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

