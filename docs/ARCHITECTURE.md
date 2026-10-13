# InternFit — System Architecture & Implementation Design

## 1. System Overview
InternFit is an end-to-end full-stack platform built for college students, placement-cell administrators, and verified alumni. It bridges authentic internship discovery across India with explainable fraud risk analysis, rule-based NLP resume skill-gap matching, independent eligibility checking, external application tracking, and alumni guidance.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (React 18 + Vite)                          |
|  - Student Discovery & URL Checker  - Placement Cell Publishing & Review Engine   |
|  - Resume Upload & NLP Matcher       - Alumni Experience & Review Portal           |
|  - Application Tracker & Stats       - Administrator Governance & Audit Trail      |
+-----------------------------------------------------------------------------------+
                                          |
                                    REST APIs / JSON
                                          v
+-----------------------------------------------------------------------------------+
|                             BACKEND SERVER (Express + TypeScript)                 |
|  Controllers -> Services -> Repositories -> Security & Network Protections         |
|  +-------------------------+  +--------------------------+  +-------------------+ |
|  | Auth & Domain Guard     |  | SSRF & Safe URL Inspector|  | NLP Skill Matcher | |
|  +-------------------------+  +--------------------------+  +-------------------+ |
|  | Application Tracker     |  | Email Outbox & Notifier  |  | Eligibility Engine| |
|  +-------------------------+  +--------------------------+  +-------------------+ |
+-----------------------------------------------------------------------------------+
                                          |
                                MySQL 8 Connection Pool
                                          v
+-----------------------------------------------------------------------------------+
|                         DATABASE (MySQL 8 Community Server)                       |
|  - Users & Roles (Argon2/Bcrypt)          - Allowed Email Domains (Admin managed) |
|  - Companies & Real Listings across India - URL Risk Assessments & Reputations    |
|  - Resumes & Normalized Skill Taxonomies  - Self-Reported Applications & History  |
|  - Alumni Profiles & Moderated Reviews    - Email Outbox & Audit Logs             |
+-----------------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
InternFit/
├── client/                     # Vite + React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/                # API client (Axios/Fetch with TanStack Query)
│   │   ├── components/         # Reusable UI components (Cards, Badges, Modals, Forms)
│   │   │   ├── common/         # Button, Input, Modal, Alert, Navbar, Footer
│   │   │   ├── internships/    # InternshipCard, FilterSidebar, RiskBadge, EligibilityTag
│   │   │   ├── risk/           # UrlCheckerPanel, EvidenceBreakdown, WarningList
│   │   │   ├── resume/         # ResumeUploader, SkillGapReport, MatchGauge
│   │   │   ├── tracker/        # ApplicationTimeline, IveAppliedModal, NotesEditor
│   │   │   └── alumni/         # ReviewCard, ReviewSubmissionModal, MentorshipCard
│   │   ├── contexts/           # AuthContext, NotificationContext
│   │   ├── hooks/              # Custom hooks (useAuth, useInternships, useUrlRisk, etc.)
│   │   ├── pages/              # Routed pages (Student, Placement, Alumni, Admin)
│   │   ├── types/              # Frontend TypeScript models
│   │   ├── utils/              # Formatting, date calculations, validation helpers
│   │   ├── App.tsx             # Route declarations & QueryClientProvider
│   │   └── main.tsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Environment, DB pool, Email, Upload config
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth, Roles, ErrorHandler, RateLimiter, Upload
│   │   ├── nlp/                # Skills taxonomy, Alias dictionary, NLP matcher
│   │   ├── repositories/       # Parameterized SQL database access layer
│   │   ├── routes/             # Route endpoints grouping
│   │   ├── security/           # SSRF validator, DNS resolver, safe HTTP agent
│   │   ├── services/           # Business logic (Risk, Skill, Eligibility, Outbox)
│   │   ├── types/              # Backend TypeScript types & DTOs
│   │   ├── utils/              # Structured logger, crypto helpers, validation
│   │   └── app.ts              # Express application assembly
│   ├── __tests__/              # Automated tests (Unit, Integration, Security)
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── migrations/             # Versioned SQL migration files (e.g. 001_initial_schema.sql)
│   ├── setup/                  # MySQL Workbench helper scripts (create_user.sql)
│   ├── seeds/                  # Real verified Indian opportunities seeds (no fake listings)
│   └── migrator.ts             # Migration runner with SHA-256 checksum tracking
├── docs/                       # Specifications, checklist, recovery, security
├── shared/                     # Shared models, DTOs, Enums, Zod schemas
│   └── index.ts
├── package.json                # Root package.json for workspace orchestration
└── .gitignore
```

---

## 3. Security & Anti-Fraud Architecture

### A. SSRF (Server-Side Request Forgery) & Safe URL Inspection
Because the URL risk checker accepts untrusted student-submitted URLs:
1. **Scheme Validation**: Only `http:` and `https:` protocols allowed.
2. **Strict IP Filtering**: Prior to making any request, the hostname is resolved via DNS. Every resolved IPv4/IPv6 address is inspected:
   - Loopback (`127.0.0.0/8`, `::1`) -> BLOCKED.
   - Private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) -> BLOCKED.
   - Link-local (`169.254.0.0/16`, `fe80::/10`) -> BLOCKED.
   - AWS/GCP/Azure Cloud Metadata (`169.254.169.254`, `fd00::/8`) -> BLOCKED.
   - Multicast/Reserved/Broadcast -> BLOCKED.
3. **DNS Rebinding Defense**: Pin the validated IP address to the outbound connection socket so time-of-check to time-of-use (TOCTOU) DNS rebinding is rejected.
4. **Redirect Hop Inspection**: Max 5 redirects. Each redirect destination's IP is freshly checked against SSRF rules before following.
5. **Timeouts & Content Length**: Connect timeout (3000ms), overall timeout (7000ms), max response size (512KB), content-type restricted to `text/html` / `application/xhtml+xml`.

### B. Transparent Risk Scoring Engine
Risk score (0 to 100) is an **evidence indicator**, not a fraudulent guarantee:
- **Warning Signs (+points toward risk)**:
  - Suspicious keywords: registration fee, security deposit, payment before interview, bank account details up-front, telegram-only contact.
  - Domain mismatch: Email claiming to be Infosys/TCS but hosted on free Gmail or typo-squatted domain.
  - High compensation claims without job requirements (e.g. "Rs 1,00,000/week for typing").
- **Trust Indicators (-points toward risk)**:
  - Official employer domain (e.g., `careers.google.com`, `tcs.com`, `microsoft.com`).
  - Verified by Placement Cell.
  - Legitimate ATS portal (Workday, Greenhouse, Lever, Taleo, Darwinbox).
- **Limitation statement**: Every assessment displays a mandatory warning:
  *"This score is based solely on observable technical signals and available text evidence. A low risk score does not guarantee genuine employment; always verify directly with official employer channels."*

### C. Skill Matching vs. Eligibility Evaluation
- **Skill Match Score**:
  $$\text{Coverage \%} = \frac{\text{Matched Required Skills}}{\text{Total Explicit Required Skills}} \times 100$$
  - Normalized skill aliases (e.g. `['react', 'react.js', 'reactjs']` maps to `React`).
  - Contextual keyword search in parsed PDF resume.
- **Eligibility Evaluation**:
  - Degree (B.Tech, M.Tech, BCA, MCA, etc.) -> Eligible / Ineligible / Unable to determine.
  - Year of study (1st, 2nd, 3rd, 4th year) -> Eligible / Ineligible / Unable to determine.
  - Branch (CSE, ECE, Mechanical, etc.) -> Eligible / Ineligible / Unable to determine.
  - Minimum CGPA -> Eligible / Ineligible / Unable to determine.
  - Overall status: `ELIGIBLE`, `INELIGIBLE`, or `UNABLE_TO_DETERMINE`.

---

## 4. Database Setup & MySQL Workbench Integration
The user has MySQL 8 running (`MySQL80`) with an existing open session in MySQL Workbench as `root@localhost`.
To adhere to the user's requirement:
- We will NOT attempt to reset the root password or disrupt the service.
- We provide `database/setup/create_user.sql` for the user to execute inside their existing MySQL Workbench session.
- The script creates a dedicated database `internfit_db` and a dedicated user `internfit_user` with permissions ONLY on `internfit_db`.
- All Node.js backend configuration will read from `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
