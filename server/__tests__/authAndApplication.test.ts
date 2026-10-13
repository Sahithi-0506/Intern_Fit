import { describe, it, expect } from 'vitest';
import { userRepository } from '../src/repositories/userRepository';
import { applicationRepository } from '../src/repositories/applicationRepository';

describe('Auth Domain Validation & Application Tracking Idempotency', () => {
  it('should allow approved college domains and reject unapproved public domains', async () => {
    // Approved
    const res1 = await userRepository.isEmailDomainAllowed('student@internfit.edu');
    expect(res1.isAllowed).toBe(true);

    const res2 = await userRepository.isEmailDomainAllowed('candidate@nitt.edu');
    expect(res2.isAllowed).toBe(true);

    // Unapproved
    const res3 = await userRepository.isEmailDomainAllowed('random@gmail.com');
    expect(res3.isAllowed).toBe(false);

    const res4 = await userRepository.isEmailDomainAllowed('scammer@tempmail.xyz');
    expect(res4.isAllowed).toBe(false);
  });

  it('should prevent duplicate applications for the same student and internship (idempotency)', async () => {
    const userId = 'student-test-01';
    const internshipId = 'int-inf-001';

    // First record
    const app1 = await applicationRepository.recordApplication(
      userId,
      internshipId,
      'Infosys Careers',
      'infosys.com',
      'Submitted via portal'
    );
    expect(app1).toBeDefined();
    expect(app1.status).toBe('applied_self_reported');

    // Repeated record attempt
    const app2 = await applicationRepository.recordApplication(
      userId,
      internshipId,
      'Infosys Careers',
      'infosys.com',
      'Second submission attempt'
    );

    // Should return the exact same application ID without duplicates
    expect(app2.id).toBe(app1.id);

    const userApps = await applicationRepository.getUserApplications(userId);
    const matches = userApps.filter(a => a.internshipId === internshipId);
    expect(matches.length).toBe(1);
  });

  it('should support alumni access request creation and admin approval workflow', async () => {
    const testAlumniId = 'usr-alumni-test-workflow';
    await userRepository.upsertAlumniProfile(testAlumniId, {
      graduationYear: 2024,
      degree: 'B.Tech',
      branch: 'CSE',
      currentCompany: 'Google',
      currentRole: 'SDE',
      verificationStatus: 'not_requested',
    });

    // Alumni requests access
    const req = await userRepository.createAlumniAccessRequest(testAlumniId, 'Requesting verification');
    expect(req.status).toBe('pending');

    const profileAfterReq = await userRepository.getAlumniProfile(testAlumniId);
    expect(profileAfterReq?.verificationStatus).toBe('pending');

    // Admin approves request
    await userRepository.decideAlumniAccessRequest(req.id, 'approved', 'admin-001', 'Verified via records');
    const profileAfterApproval = await userRepository.getAlumniProfile(testAlumniId);
    expect(profileAfterApproval?.verificationStatus).toBe('approved');

    // Admin can also revoke access
    await userRepository.revokeAlumniAccess(testAlumniId, 'admin-001', 'Revoked for testing');
    const profileAfterRevocation = await userRepository.getAlumniProfile(testAlumniId);
    expect(profileAfterRevocation?.verificationStatus).toBe('revoked');
  });
});
