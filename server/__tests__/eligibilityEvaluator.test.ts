import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '../src/nlp/eligibilityEvaluator';

describe('Independent Eligibility Evaluator', () => {
  const baseCriteria = {
    eligibleDegrees: ['B.Tech', 'M.Tech'],
    eligibleYears: [3, 4],
    eligibleBranches: ['Computer Science', 'Information Technology'],
    minCgpa: 7.5,
    allowsBacklogs: false,
  };

  it('should return eligible when all criteria are satisfied', () => {
    const student = {
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 3,
      graduationYear: 2027,
      cgpa: 8.4,
      hasActiveBacklogs: false,
    };

    const result = evaluateEligibility(student, baseCriteria);
    expect(result.overallResult).toBe('eligible');
    expect(result.breakdown.every(b => b.status === 'eligible')).toBe(true);
  });

  it('should return ineligible if CGPA is below cutoff', () => {
    const student = {
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 3,
      graduationYear: 2027,
      cgpa: 7.1, // below 7.5
      hasActiveBacklogs: false,
    };

    const result = evaluateEligibility(student, baseCriteria);
    expect(result.overallResult).toBe('ineligible');
    const cgpaCheck = result.breakdown.find(b => b.criterion === 'cgpa');
    expect(cgpaCheck?.status).toBe('ineligible');
  });

  it('should return ineligible if student has active backlogs and employer disallows them', () => {
    const student = {
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 3,
      graduationYear: 2027,
      cgpa: 8.0,
      hasActiveBacklogs: true, // not allowed
    };

    const result = evaluateEligibility(student, baseCriteria);
    expect(result.overallResult).toBe('ineligible');
    const backlogCheck = result.breakdown.find(b => b.criterion === 'backlogs');
    expect(backlogCheck?.status).toBe('ineligible');
  });

  it('should return unable_to_determine when required profile information is missing', () => {
    const student = {
      degree: null, // missing
      branch: 'Computer Science',
      yearOfStudy: null, // missing
      graduationYear: null,
      cgpa: null, // missing
      hasActiveBacklogs: false,
    };

    const result = evaluateEligibility(student, baseCriteria);
    expect(result.overallResult).toBe('unable_to_determine');
    const degreeCheck = result.breakdown.find(b => b.criterion === 'degree');
    expect(degreeCheck?.status).toBe('unable_to_determine');
  });
});
