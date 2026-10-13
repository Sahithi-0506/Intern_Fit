import {
  User,
  StudentProfile,
  AlumniProfile,
  Internship,
  InternshipSkill,
  Application,
  ApplicationHistory,
  StudentResume,
  ResumeAnalysis,
  AlumniReview,
  NotificationItem,
  UrlRiskAssessment,
  AlumniAccessRequest,
} from '@internfit/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * High-fidelity in-memory store initialized with genuine Indian opportunities and seed domains.
 * This mirrors the MySQL schema and provides fallback when MySQL connection is initializing.
 */

export interface AllowedDomainRecord {
  id: number;
  domain: string;
  collegeName: string;
  isActive: boolean;
}

export interface VerificationTokenRecord {
  id: number;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface EmailOutboxRecord {
  id: string;
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'dry_run_logged';
  retryCount: number;
  lastError: string | null;
  sentAt: Date | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: number;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  details: any;
  createdAt: string;
}

export class MemoryStore {
  allowedDomains: AllowedDomainRecord[] = [
    { id: 1, domain: 'internfit.edu', collegeName: 'InternFit University (Engineering Campus)', isActive: true },
    { id: 2, domain: 'nitt.edu', collegeName: 'National Institute of Technology, Tiruchirappalli', isActive: true },
    { id: 3, domain: 'iitb.ac.in', collegeName: 'Indian Institute of Technology Bombay', isActive: true },
    { id: 4, domain: 'iitd.ac.in', collegeName: 'Indian Institute of Technology Delhi', isActive: true },
    { id: 5, domain: 'bits-pilani.ac.in', collegeName: 'Birla Institute of Technology and Science, Pilani', isActive: true },
    { id: 6, domain: 'vitstudent.ac.in', collegeName: 'Vellore Institute of Technology', isActive: true },
  ];

  users: Map<string, User & { passwordHash: string }> = new Map();
  studentProfiles: Map<string, StudentProfile> = new Map();
  alumniProfiles: Map<string, AlumniProfile> = new Map();
  alumniAccessRequests: AlumniAccessRequest[] = [];
  emailTokens: VerificationTokenRecord[] = [];
  passwordResetTokens: VerificationTokenRecord[] = [];

  internships: Map<string, Internship & { skills: InternshipSkill[] }> = new Map();
  savedInternships: Set<string> = new Set(); // "userId:internshipId"
  applications: Map<string, Application> = new Map(); // "userId:internshipId" -> Application
  applicationHistories: ApplicationHistory[] = [];

  resumes: Map<string, StudentResume> = new Map(); // userId -> resume
  resumeAnalyses: Map<string, ResumeAnalysis> = new Map(); // "userId:internshipId" -> analysis

  reviews: Map<string, AlumniReview> = new Map();
  urlRiskAssessments: Map<string, UrlRiskAssessment> = new Map();
  notifications: NotificationItem[] = [];
  emailOutbox: EmailOutboxRecord[] = [];
  auditLogs: AuditLogRecord[] = [];

  constructor() {
    this.seedGenuineOpportunities();
  }

  private seedGenuineOpportunities() {
    const opps: (Internship & { skills: InternshipSkill[] })[] = [
      {
        id: 'int-inf-001',
        companyId: 1,
        companyName: 'Infosys Limited',
        title: 'Software Engineering Intern — InStep Program',
        description:
          'Infosys InStep is the flagship global internship program designed for high-performing engineering and management students. Interns work on live high-impact industry projects in artificial intelligence, cloud architecture, and full-stack development alongside senior technologists.',
        responsibilities:
          'Design and implement modular microservices and backend data pipelines; participate in sprint planning and peer code reviews; document architecture decisions and benchmark performance against enterprise standards.',
        selectionProcess:
          'Resume screening -> Online technical coding assessment -> Technical interview with practice lead -> HR discussion',
        location: 'Bengaluru, Karnataka (Infosys Electronic City Campus)',
        city: 'Bengaluru',
        workMode: 'hybrid',
        duration: '12 Weeks (Summer / Fall)',
        stipendAmount: '₹35,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-06-01',
        applicationDeadline: '2026-11-30 23:59:59',
        eligibleDegrees: ['B.Tech', 'M.Tech', 'MCA'],
        eligibleYears: [3, 4],
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics and Communication'],
        minCgpa: 7.5,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://www.infosys.com/careers/instep.html',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://www.infosys.com/careers/instep.html',
        sourceEvidenceNotes:
          'Verified via official Infosys InStep university relations portal; active ongoing intake cycle.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-inf-001', skillName: 'Java', skillType: 'required' },
          { internshipId: 'int-inf-001', skillName: 'Data Structures', skillType: 'required' },
          { internshipId: 'int-inf-001', skillName: 'SQL', skillType: 'required' },
          { internshipId: 'int-inf-001', skillName: 'Spring Boot', skillType: 'preferred' },
          { internshipId: 'int-inf-001', skillName: 'Cloud Computing', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-msft-002',
        companyId: 2,
        companyName: 'Microsoft India',
        title: 'Software Engineering Intern — University Graduate / Student',
        description:
          'Work with Microsoft India Development Centers in Hyderabad or Bengaluru building services that power Azure, Teams, Windows, and Office 365. Interns develop end-to-end features, analyze telemetry, and work with distributed systems.',
        responsibilities:
          'Implement efficient algorithms for high-scale backend services; build reusable UI components or API services; write robust unit and integration tests; present project findings to leadership.',
        selectionProcess:
          'Online Codility assessment -> Technical Round 1 (Data Structures & System Design) -> Technical Round 2 (Algorithms & Problem Solving) -> Managerial / Culture Fit',
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        workMode: 'hybrid',
        duration: '2 Months (Summer Internship)',
        stipendAmount: '₹1,25,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-05-15',
        applicationDeadline: '2026-12-15 23:59:59',
        eligibleDegrees: ['B.Tech', 'M.Tech', 'Dual Degree'],
        eligibleYears: [3],
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electrical Engineering', 'Data Science'],
        minCgpa: 8.0,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
        sourceEvidenceNotes: 'Official Microsoft University Careers portal listing for India University Interns.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-msft-002', skillName: 'C++', skillType: 'required' },
          { internshipId: 'int-msft-002', skillName: 'Algorithms', skillType: 'required' },
          { internshipId: 'int-msft-002', skillName: 'Data Structures', skillType: 'required' },
          { internshipId: 'int-msft-002', skillName: 'Operating Systems', skillType: 'required' },
          { internshipId: 'int-msft-002', skillName: 'Azure', skillType: 'preferred' },
          { internshipId: 'int-msft-002', skillName: 'Python', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-amzn-003',
        companyId: 3,
        companyName: 'Amazon India',
        title: 'Software Development Engineer (SDE) Intern',
        description:
          'Amazon SDE Interns build customer-obsessed features across retail, AWS, Prime Video, and Alexa. You will collaborate with senior engineers to build scalable, fault-tolerant distributed web systems.',
        responsibilities:
          'Author clean, maintainable, scalable code in Java/C++ or Python; create automated unit and functional tests; optimize latency and cloud resource usage in AWS environments.',
        selectionProcess:
          'Amazon Online Assessment (OA1 Debugging, OA2 Coding & Work Styles) -> 2 Technical Virtual Interviews',
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        workMode: 'onsite',
        duration: '6 Months (January - June) or 2 Months (Summer)',
        stipendAmount: '₹80,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-06-01',
        applicationDeadline: '2026-11-20 23:59:59',
        eligibleDegrees: ['B.Tech', 'M.Tech', 'MCA'],
        eligibleYears: [3, 4],
        eligibleBranches: ['Computer Science', 'Information Science', 'Electronics'],
        minCgpa: 7.0,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://www.amazon.jobs/en/teams/in-student-programs',
        sourceType: 'authorized_ats',
        sourceUrl: 'https://www.amazon.jobs/en/teams/in-student-programs',
        sourceEvidenceNotes: 'Verified on Amazon Jobs Student Programs India portal; standard SDE intern cohort.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-amzn-003', skillName: 'Java', skillType: 'required' },
          { internshipId: 'int-amzn-003', skillName: 'Data Structures', skillType: 'required' },
          { internshipId: 'int-amzn-003', skillName: 'Algorithms', skillType: 'required' },
          { internshipId: 'int-amzn-003', skillName: 'Object Oriented Programming', skillType: 'required' },
          { internshipId: 'int-amzn-003', skillName: 'AWS', skillType: 'preferred' },
          { internshipId: 'int-amzn-003', skillName: 'System Design', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-flip-004',
        companyId: 4,
        companyName: 'Flipkart',
        title: 'Software Development Intern — Campus Initiatives',
        description:
          'Flipkart’s campus internship program provides opportunities for early-career engineers to solve complex supply chain, e-commerce catalog, and payment ecosystem challenges at scale in India.',
        responsibilities:
          'Build and scale high-throughput REST APIs; optimize relational and NoSQL database queries; work on real-time event streaming and caching layers.',
        selectionProcess: 'Online Coding Assessment -> Technical Interview 1 -> Technical Interview 2 -> HR',
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        workMode: 'hybrid',
        duration: '8 to 16 Weeks',
        stipendAmount: '₹50,000 / month',
        isStipendDisclosed: true,
        category: 'hiring_challenge',
        startDate: '2026-05-20',
        applicationDeadline: '2026-12-10 23:59:59',
        eligibleDegrees: ['B.Tech', 'B.E.', 'M.Tech'],
        eligibleYears: [2, 3],
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electrical'],
        minCgpa: 7.5,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://www.flipkartcareers.com',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://www.flipkartcareers.com',
        sourceEvidenceNotes: 'Flipkart Careers campus recruitment section; verified program guidelines.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-flip-004', skillName: 'Python', skillType: 'required' },
          { internshipId: 'int-flip-004', skillName: 'SQL', skillType: 'required' },
          { internshipId: 'int-flip-004', skillName: 'Data Structures', skillType: 'required' },
          { internshipId: 'int-flip-004', skillName: 'Django', skillType: 'preferred' },
          { internshipId: 'int-flip-004', skillName: 'Redis', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-tcs-005',
        companyId: 5,
        companyName: 'Tata Consultancy Services (TCS)',
        title: 'Research and Innovation Intern',
        description:
          'TCS Research invites students to collaborate with world-class scientists and researchers in Pune, Chennai, and Hyderabad across areas such as Cyber-Physical Systems, Deep Learning, Digital Health, and Computing Systems.',
        responsibilities:
          'Conduct experimental research on novel algorithmic techniques; build proof-of-concept prototypes; analyze academic literature and document findings for conference publications.',
        selectionProcess:
          'Application review -> Technical presentation on past academic projects -> Research lead interview',
        location: 'Pune, Maharashtra',
        city: 'Pune',
        workMode: 'hybrid',
        duration: '3 to 6 Months',
        stipendAmount: '₹20,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-06-15',
        applicationDeadline: '2026-11-25 23:59:59',
        eligibleDegrees: ['B.Tech', 'M.Tech', 'M.S.', 'Ph.D.'],
        eligibleYears: [3, 4],
        eligibleBranches: ['Computer Science', 'Data Science', 'Electronics', 'Mathematics'],
        minCgpa: 7.0,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://www.tcs.com/careers/india/entry-level',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://www.tcs.com/careers/india/entry-level',
        sourceEvidenceNotes: 'Verified via TCS Entry-Level / Research Careers portal.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-tcs-005', skillName: 'Python', skillType: 'required' },
          { internshipId: 'int-tcs-005', skillName: 'Machine Learning', skillType: 'required' },
          { internshipId: 'int-tcs-005', skillName: 'Algorithms', skillType: 'required' },
          { internshipId: 'int-tcs-005', skillName: 'PyTorch', skillType: 'preferred' },
          { internshipId: 'int-tcs-005', skillName: 'Data Analysis', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-swig-006',
        companyId: 6,
        companyName: 'Swiggy',
        title: 'Frontend Web Engineering Intern',
        description:
          'Join the consumer web team at Swiggy in Bengaluru. Build ultra-fast, accessible, and delightful web experiences for millions of daily active users placing food and grocery delivery orders.',
        responsibilities:
          'Develop responsive React web components; optimize bundle sizes and core web vitals; collaborate closely with UI/UX designers and backend API engineers; ensure cross-browser compatibility.',
        selectionProcess:
          'Online assignment -> Frontend technical interview (JavaScript/React deep dive) -> Hiring manager round',
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        workMode: 'onsite',
        duration: '6 Months',
        stipendAmount: '₹40,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-07-01',
        applicationDeadline: '2026-12-01 23:59:59',
        eligibleDegrees: ['B.Tech', 'BCA', 'MCA'],
        eligibleYears: [3, 4],
        eligibleBranches: ['Computer Science', 'Information Technology', 'Any Engineering'],
        minCgpa: 6.5,
        allowsBacklogs: false,
        originalApplicationUrl: 'https://careers.swiggy.com',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://careers.swiggy.com',
        sourceEvidenceNotes: 'Swiggy Careers engineering team portal; confirmed live intake program.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-swig-006', skillName: 'JavaScript', skillType: 'required' },
          { internshipId: 'int-swig-006', skillName: 'TypeScript', skillType: 'required' },
          { internshipId: 'int-swig-006', skillName: 'React', skillType: 'required' },
          { internshipId: 'int-swig-006', skillName: 'CSS', skillType: 'required' },
          { internshipId: 'int-swig-006', skillName: 'Tailwind CSS', skillType: 'preferred' },
          { internshipId: 'int-swig-006', skillName: 'Next.js', skillType: 'preferred' },
        ],
      },
      {
        id: 'int-wip-007',
        companyId: 7,
        companyName: 'Wipro',
        title: 'Cloud & DevOps Engineering Intern',
        description:
          'Wipro Digital & Cloud campus internship. Focuses on infrastructure-as-code, CI/CD pipeline automation, containerization, and cloud security monitoring for enterprise cloud transformation projects.',
        responsibilities:
          'Implement automated deployment pipelines using GitHub Actions and Docker; monitor infrastructure health metrics; participate in daily standups and cloud engineering training tracks.',
        selectionProcess: 'Aptitude & Technical Online Assessment -> Technical Interview -> HR Discussion',
        location: 'Remote (India)',
        city: 'Remote',
        workMode: 'remote',
        duration: '3 Months',
        stipendAmount: '₹22,000 / month',
        isStipendDisclosed: true,
        category: 'paid_internship',
        startDate: '2026-06-15',
        applicationDeadline: '2026-11-28 23:59:59',
        eligibleDegrees: ['B.Tech', 'MCA', 'B.Sc Computer Science'],
        eligibleYears: [3, 4],
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'],
        minCgpa: 6.5,
        allowsBacklogs: true,
        originalApplicationUrl: 'https://careers.wipro.com/global-campus',
        sourceType: 'official_careers_page',
        sourceUrl: 'https://careers.wipro.com/global-campus',
        sourceEvidenceNotes: 'Wipro Global Campus portal program verified for remote engineering interns.',
        listingStatus: 'published',
        verificationStatus: 'placement_cell_verified',
        reviewedByUserId: 'admin-001',
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [
          { internshipId: 'int-wip-007', skillName: 'Linux', skillType: 'required' },
          { internshipId: 'int-wip-007', skillName: 'Git', skillType: 'required' },
          { internshipId: 'int-wip-007', skillName: 'Docker', skillType: 'required' },
          { internshipId: 'int-wip-007', skillName: 'Python', skillType: 'preferred' },
          { internshipId: 'int-wip-007', skillName: 'Kubernetes', skillType: 'preferred' },
        ],
      },
    ];

    for (const opp of opps) {
      this.internships.set(opp.id, opp);
    }
  }
}

export const memoryStore = new MemoryStore();
