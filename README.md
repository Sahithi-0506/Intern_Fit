# InternFit 🎓

### A Smart Internship Discovery, Risk Analysis, Skill Matching, and Alumni Review Platform

InternFit is a college-oriented web platform that helps students discover internships, assess potential warning signs in internship links, compare internship requirements with their skills, and manage their application journey. It also gives the college Placement Cell a centralized way to publish opportunities and approve alumni access, while verified and approved alumni can contribute internship reviews.

---

## 📌 Problem Statement

Students find internships through job portals, social media, messaging groups, and company websites. Some listings may be misleading or suspicious, and students may not know how to evaluate warning signs before applying. Students can also struggle to decide which opportunities best match their existing skills, while tracking applications and deadlines across different platforms.

At the same time, colleges need a trusted workflow for publishing opportunities, managing access to alumni contributions, and collecting useful internship experiences from alumni.

**InternFit addresses these needs in one platform** by combining internship discovery, URL-based risk assessment, skill matching, application tracking, email verification, Placement Cell management, and an approval-based alumni review workflow.

## 🎯 Main Goals

- Help students find and organize internship opportunities.
- Assess potential risk indicators from a pasted internship URL using rule-based checks and NLP/text analysis where supported.
- Explain risk signals so students can make more informed decisions.
- Match internship requirements against a student's skills and show a match result.
- Provide email verification for supported account-registration workflows.
- Let the Placement Cell publish and manage internship opportunities.
- Ensure alumni access is reviewed by the Placement Cell before alumni can submit reviews.
- Store application and workflow data persistently in MySQL.

## ✨ Features and User Workflows

### 1. 👨‍🎓 Student Dashboard

The Student Dashboard is the student's main workspace for discovering, assessing, and managing internship opportunities.

- **Browse internships:** Explore opportunities published through the platform, including available role details, eligibility information, skills, and deadlines when provided.
- **Internship details:** Review the information available for a listing before deciding whether to apply.
- **URL-based risk analysis:** Paste an internship URL into the risk-checking feature to evaluate available signals. Depending on the implementation, checks may include URL/domain patterns, suspicious wording, requests for payment or sensitive information, and other rule-based or text-based indicators.
- **Risk explanation:** Present the detected warning signs and a risk result where supported. The result is an advisory assessment—not a guarantee that a listing is safe or fraudulent.
- **Skill matching:** Compare a student's listed skills with the skills required by an internship. Show matching skills, skills that may be missing, and a match score or summary if implemented.
- **Saved opportunities:** Save internships to revisit later, if enabled.
- **Application tracker:** Organize application statuses and monitor progress, if enabled.
- **Profile and resume:** Maintain profile, skills, and resume information where those modules are implemented.
- **Deadlines:** View application deadlines so opportunities can be prioritized.

**Typical student journey:** Sign up → verify email if required → sign in → open the dashboard → browse or paste an internship URL for risk analysis → review warning signals → compare required skills with personal skills → save or track the opportunity.

### 2. 🔎 Internship URL Risk Analysis — Core Feature

Risk analysis is one of InternFit's central features. It is designed to help students pause and review an opportunity before trusting it.

**How the workflow is intended to work:**

1. The student pastes an internship or job-posting URL into the risk-analysis interface.
2. The application validates the URL format and applies the checks supported by the backend.
3. A rule-based verifier can inspect known indicators such as unusual URL patterns, suspicious keywords, requests for upfront payment, unrealistic promises, or requests for sensitive personal data—depending on the rules actually implemented.
4. NLP or text analysis may inspect accessible listing text for suspicious language or other risk-related signals, if that component is configured and available.
5. The system combines the signals according to its implemented scoring logic.
6. The interface presents a risk level or score, the reasons detected, and practical cautionary guidance where supported.

**Important limitations:** A URL or text check cannot conclusively prove that an internship is genuine or fraudulent. Results depend on the data the application can access and the rules or NLP logic it uses. A low-risk result is not a guarantee of safety; students should independently verify the company and never pay to secure an internship or share unnecessary sensitive information.

### 3. 🧩 Internship Skill Matching — Core Feature

Skill matching helps students compare their current skills with the requirements of internship opportunities.

- Read or use the skills specified for an internship.
- Compare those requirements with the student's profile skills or other supported skill input.
- Identify skills that match.
- Highlight skills that are missing or may need improvement, where implemented.
- Display a match score, percentage, or summary if supported by the current algorithm.
- Help students prioritize opportunities and identify learning areas.

**Typical workflow:** Add or update personal skills → open an internship → compare required skills → review matching and missing skills → decide whether to apply or improve relevant skills.

A match result is guidance, not a hiring prediction. The actual result depends on the skills data and matching algorithm used by the application.

### 4. 🎓 Alumni Portal and Review Workflow

InternFit's alumni workflow is designed to collect internship experiences from alumni while allowing the college Placement Cell to control who can contribute.

- **Alumni registration:** An alumni user creates an account using the supported registration process.
- **Email verification:** If enabled for alumni accounts, the user receives a verification email and completes the verification step before proceeding with the protected workflow.
- **Access request:** The alumni user requests permission to access the alumni review features.
- **Pending status:** The request remains pending until the Placement Cell reviews it.
- **Placement Cell decision:** An authorized admin can approve or reject the request.
- **Access after approval:** Approved alumni can access the permitted review features. Rejected or pending users should not be able to submit reviews if the backend authorization rules enforce this workflow.
- **Submit an internship review:** Approved alumni can share their internship experience, company/role details, and feedback fields provided by the application.
- **Review moderation:** If moderation is implemented, the Placement Cell can review submitted content before it becomes visible to students.
- **Status visibility:** Alumni can view their access or review status where supported.

**Typical alumni journey:** Register → verify email if required → sign in → request alumni access → wait for Placement Cell approval → access the review form after approval → submit an internship review → view its status if available.

Email verification confirms access to an email address; it does not, by itself, prove that someone is an alumnus. Alumni authorization should be controlled by the Placement Cell approval workflow and enforced on the backend.

### 5. 🏢 Admin Dashboard — College Placement Cell

The Admin role represents the college Placement Cell. It manages internship listings and alumni access/review workflows.

- **Admin account security:** The admin should use the authorized account setup process. If email verification is part of admin registration, the admin must complete it. Admin accounts should not be granted merely because a user selects an admin role during public registration.
- **Publish opportunities:** Create internship listings with details such as title, company, description, location or work mode, required skills, application URL, and deadline, depending on the form fields implemented.
- **Edit and manage listings:** Update or manage published opportunities where supported.
- **Alumni request management:** View pending alumni access requests and approve or reject them.
- **Review management:** View and moderate alumni reviews if the application includes this functionality.
- **Status tracking:** Review counts and pending/approved/rejected statuses should reflect the persisted database records.
- **Role-based authorization:** Only authorized Placement Cell accounts should be able to publish opportunities or approve alumni access. These permissions must be checked by backend endpoints, not just hidden in the frontend.

**Typical Placement Cell journey:** Sign in to the authorized admin account → create and publish an internship → review incoming alumni access requests → approve or reject requests → manage alumni reviews if enabled.

### 6. ✉️ Email Verification and Email Delivery

InternFit is configured to use Nodemailer with Gmail SMTP for supported email workflows.

- Send a verification message to a user's registered email address when the relevant registration flow requests it.
- Allow the user to complete the verification process through the mechanism implemented by the application.
- Support separate student, alumni, and admin/Placement Cell policies as defined by the backend.
- Provide useful error handling when email delivery fails.

**Important distinction:** Email verification and role approval are different checks. Verifying an email proves control of that email inbox; it does not automatically grant alumni or Placement Cell privileges. Alumni access should still require Placement Cell approval. Admin privileges should be provisioned securely by an authorized setup process.

Email delivery depends on valid SMTP configuration and network access. The README should only claim each email flow is working after sending and receiving a real test email successfully.

---

## 🧰 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript | User interface and typed application code |
| Frontend tooling | Vite | Development server and production bundling |
| Routing | React Router | Navigation between dashboards and pages |
| Backend | Node.js, Express.js, TypeScript | REST API and application business logic |
| Database | MySQL | Persistent application data |
| Database administration | MySQL Workbench | Local database management |
| Email | Nodemailer + Gmail SMTP | Email delivery for configured account workflows |
| Password hashing | bcryptjs, if used by the current auth flow | Store password hashes rather than plain-text passwords |
| Authentication | JWT, if used by the current auth flow | Represent authenticated sessions/claims |
| Package management | npm | Dependency and script management |

The repository includes client, server, shared, database, and docs directories. Confirm optional libraries and the exact algorithm used by risk analysis and skill matching against the current source code before listing them as definitive implementation details.

## 🏗️ High-Level Architecture

```text
Students / Alumni / Placement Cell Admin
                 |
                 v
       React + TypeScript + Vite
              Frontend
                 |
             REST API
                 |
                 v
       Node.js + Express + TypeScript
              Backend
          /       |        \
         v        v         v
      MySQL   Risk/NLP   Nodemailer
    Database  Services   Gmail SMTP
```

## 📁 Project Structure

```text
InternFit/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # API client and requests
│       ├── components/     # Shared and feature UI components
│       │   ├── alumni/
│       │   ├── internships/
│       │   ├── risk/
│       │   ├── resume/
│       │   └── tracker/
│       ├── contexts/       # Shared React contexts
│       └── pages/          # Dashboard and application pages
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── nlp/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── security/
│   │   └── services/
│   └── .env                # Local secrets; never commit
├── shared/                 # Shared types/schemas
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── setup/
├── docs/                   # Project documentation
├── package.json
└── README.md
```

## 📋 Prerequisites

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Git (optional)

## 🚀 Installation and Setup

### 1. Clone or open the project

```bash
git clone <YOUR_REPOSITORY_URL>
cd InternFit
```

If the project is already on your computer, open PowerShell in the `C:\InternFit` project root.

### 2. Install dependencies

```powershell
npm.cmd install
```

### 3. Create the database

In MySQL Workbench, create the development database:

```sql
CREATE DATABASE internfit_db;
```

Use a dedicated MySQL application user with a strong password and only the permissions required by the application.

### 4. Configure `server/.env`

Use the variable names expected by the current backend configuration. Example values:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_SECRET=replace_with_another_long_random_secret

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_app_user
DB_PASSWORD=your_mysql_app_password
DB_NAME=internfit_db

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail_address
SMTP_PASS=your_google_app_password
SMTP_FROM=InternFit <your_gmail_address>

UPLOAD_DIR=./uploads/resumes
MAX_UPLOAD_SIZE_BYTES=5242880
```

- Replace placeholders with your own values. Never paste real secrets into the README.
- Gmail SMTP on port `465` normally uses `SMTP_SECURE=true`. Port `587` normally uses STARTTLS with `SMTP_SECURE=false`.
- Use a Google App Password where supported, not your normal Gmail password.
- If SMTP is blocked by the current network, email delivery may fail even when credentials are correct.
- Ensure `.env` is excluded from Git. Rotate any secret that has been exposed.
- Check the server source for which optional variables are actually required.

### 5. Run database migrations

If the root `package.json` defines this script, run:

```powershell
npm.cmd run db:migrate
```

Review migrations before running them against a database containing important data. Do not drop or reset a database to fix a migration problem.

### 6. Start the application

```powershell
npm.cmd run dev
```

In the current development setup, expected local URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Check the root `package.json` for the exact scripts and ports.

## 🧪 Build and Test Checklist

Build the project with:

```powershell
npm.cmd run build
```

A successful build confirms that configured compilation and bundling steps pass; it does not prove that every workflow works end to end.

Before a demo or release, test the following:

- [ ] Student registration, email verification (if enabled), login, and logout.
- [ ] Student dashboard loads real data and does not rely on hardcoded placeholders.
- [ ] URL risk analysis accepts valid URLs and explains its detected signals.
- [ ] Risk analysis handles malformed URLs and unavailable page content safely.
- [ ] Skill matching compares internship requirements with the student's actual skills.
- [ ] Saved opportunities and application statuses persist after a restart, if enabled.
- [ ] Alumni registration and email verification work, if enabled.
- [ ] Pending alumni users cannot submit reviews before Placement Cell approval.
- [ ] Approved alumni can submit reviews; rejected users remain restricted.
- [ ] Admin/Placement Cell can publish opportunities and the listings appear to students.
- [ ] Only authorized admins can approve alumni access or manage opportunities.
- [ ] Dashboard counts and request statuses match database records.
- [ ] Email delivery succeeds with the configured SMTP provider.
- [ ] Application deadlines save correctly, including date/time-zone behavior.

## 🔐 Security and Responsible Use

- Keep `.env`, passwords, tokens, app passwords, and private resume files out of version control.
- Never store passwords in plain text; use a suitable password-hashing method.
- Enforce permissions on backend routes as well as in the UI.
- Do not allow public registration to self-assign the Placement Cell admin role.
- Validate user input and protect URL-fetching features against unsafe destinations and server-side request forgery (SSRF).
- Set upload type and size limits if resume uploads are enabled.
- Do not treat risk scores as definitive proof of fraud or legitimacy.
- Do not ask students to pay for an internship or share unnecessary sensitive data.
- Use HTTPS and secure secret management for production deployments.

## 🛣️ Future Enhancements

- Improve risk explanations and verification signals.
- Expand skill matching and personalized recommendations.
- Add deadline notifications and reminders.
- Provide Placement Cell analytics and reports.
- Add automated tests for authentication, role permissions, risk checks, and matching.
- Improve accessibility, deployment, monitoring, and audit logs.

These are potential enhancements unless already implemented and tested.

## 🤝 Contributing

1. Create a branch for your change.
2. Keep changes focused and document new configuration variables.
3. Run the build and relevant tests.
4. Open a pull request with a clear summary and testing notes.

## 📄 License

No license has been specified yet. Add a `LICENSE` file before permitting reuse, modification, or redistribution.

---

---

## 👩‍💻 Author

**Sahithi Achyutha Ishwarya Kalla**  
Student Developer | InternFit Project

- GitHub: (https://github.com/Sahithi-0506)
- LinkedIn: (https://www.linkedin.com/in/sahithi-achyutha-ishwarya-kalla-317799319/)

---

*InternFit — Making internship discovery smarter, safer, and more skill-focused.*

**InternFit — A Smart Internship Discovery, Risk Analysis, Skill Matching, and Alumni Review Platform**

*Helping students assess opportunities, understand skill fit, and learn from alumni through a Placement Cell-managed platform.*
