import { EligibilityCriterionBreakdown, EligibilityResult } from '@internfit/shared';

export interface StudentEligibilityProfile {
  degree: string | null;
  branch: string | null;
  yearOfStudy: number | null;
  graduationYear: number | null;
  cgpa: number | null;
  hasActiveBacklogs: boolean;
}

export interface InternshipEligibilityCriteria {
  eligibleDegrees: string[];
  eligibleYears: number[];
  eligibleBranches: string[];
  minCgpa: number | null;
  allowsBacklogs: boolean;
}

export interface EligibilityEvaluationResult {
  overallResult: EligibilityResult;
  breakdown: EligibilityCriterionBreakdown[];
  summaryNote: string;
}

export function evaluateEligibility(
  student: StudentEligibilityProfile,
  criteria: InternshipEligibilityCriteria
): EligibilityEvaluationResult {
  const breakdown: EligibilityCriterionBreakdown[] = [];
  let hasIneligible = false;
  let hasUnableToDetermine = false;

  // 1. Degree Evaluation
  if (!criteria.eligibleDegrees || criteria.eligibleDegrees.length === 0) {
    breakdown.push({
      criterion: 'degree',
      label: 'Degree / Program',
      studentValue: student.degree,
      requiredValue: 'Open to all degrees',
      status: 'eligible',
      reason: 'Employer did not restrict specific degree requirements.',
    });
  } else if (!student.degree) {
    hasUnableToDetermine = true;
    breakdown.push({
      criterion: 'degree',
      label: 'Degree / Program',
      studentValue: null,
      requiredValue: criteria.eligibleDegrees.join(', '),
      status: 'unable_to_determine',
      reason: 'Your profile does not specify your degree yet.',
    });
  } else {
    const studentDegNorm = student.degree.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isMatched = criteria.eligibleDegrees.some(reqDeg => {
      const reqNorm = reqDeg.toLowerCase().replace(/[^a-z0-9]/g, '');
      return studentDegNorm.includes(reqNorm) || reqNorm.includes(studentDegNorm);
    });

    if (isMatched) {
      breakdown.push({
        criterion: 'degree',
        label: 'Degree / Program',
        studentValue: student.degree,
        requiredValue: criteria.eligibleDegrees.join(', '),
        status: 'eligible',
        reason: `Your degree (${student.degree}) matches the required criteria.`,
      });
    } else {
      hasIneligible = true;
      breakdown.push({
        criterion: 'degree',
        label: 'Degree / Program',
        studentValue: student.degree,
        requiredValue: criteria.eligibleDegrees.join(', '),
        status: 'ineligible',
        reason: `Your degree (${student.degree}) is not listed in the accepted degrees.`,
      });
    }
  }

  // 2. Year of Study Evaluation
  if (!criteria.eligibleYears || criteria.eligibleYears.length === 0) {
    breakdown.push({
      criterion: 'year',
      label: 'Year of Study',
      studentValue: student.yearOfStudy,
      requiredValue: 'Open to all years',
      status: 'eligible',
      reason: 'No restrictions on academic year.',
    });
  } else if (student.yearOfStudy === null || student.yearOfStudy === undefined) {
    hasUnableToDetermine = true;
    breakdown.push({
      criterion: 'year',
      label: 'Year of Study',
      studentValue: null,
      requiredValue: criteria.eligibleYears.map(y => `Year ${y}`).join(', '),
      status: 'unable_to_determine',
      reason: 'Your profile does not state your current year of study.',
    });
  } else {
    if (criteria.eligibleYears.includes(student.yearOfStudy)) {
      breakdown.push({
        criterion: 'year',
        label: 'Year of Study',
        studentValue: `Year ${student.yearOfStudy}`,
        requiredValue: criteria.eligibleYears.map(y => `Year ${y}`).join(', '),
        status: 'eligible',
        reason: `Year ${student.yearOfStudy} is eligible for this opportunity.`,
      });
    } else {
      hasIneligible = true;
      breakdown.push({
        criterion: 'year',
        label: 'Year of Study',
        studentValue: `Year ${student.yearOfStudy}`,
        requiredValue: criteria.eligibleYears.map(y => `Year ${y}`).join(', '),
        status: 'ineligible',
        reason: `Year ${student.yearOfStudy} does not meet the specified years (${criteria.eligibleYears.join(', ')}).`,
      });
    }
  }

  // 3. Branch / Specialization Evaluation
  if (!criteria.eligibleBranches || criteria.eligibleBranches.length === 0) {
    breakdown.push({
      criterion: 'branch',
      label: 'Branch / Specialization',
      studentValue: student.branch,
      requiredValue: 'Open to all branches',
      status: 'eligible',
      reason: 'All academic branches are accepted.',
    });
  } else if (!student.branch) {
    hasUnableToDetermine = true;
    breakdown.push({
      criterion: 'branch',
      label: 'Branch / Specialization',
      studentValue: null,
      requiredValue: criteria.eligibleBranches.join(', '),
      status: 'unable_to_determine',
      reason: 'Your profile does not state your branch.',
    });
  } else {
    const studentBrNorm = student.branch.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isMatched = criteria.eligibleBranches.some(reqBr => {
      const reqNorm = reqBr.toLowerCase().replace(/[^a-z0-9]/g, '');
      return studentBrNorm.includes(reqNorm) || reqNorm.includes(studentBrNorm) || reqNorm.includes('any');
    });

    if (isMatched) {
      breakdown.push({
        criterion: 'branch',
        label: 'Branch / Specialization',
        studentValue: student.branch,
        requiredValue: criteria.eligibleBranches.join(', '),
        status: 'eligible',
        reason: `Your branch (${student.branch}) is eligible.`,
      });
    } else {
      hasIneligible = true;
      breakdown.push({
        criterion: 'branch',
        label: 'Branch / Specialization',
        studentValue: student.branch,
        requiredValue: criteria.eligibleBranches.join(', '),
        status: 'ineligible',
        reason: `Your branch (${student.branch}) is not included in eligible branches.`,
      });
    }
  }

  // 4. CGPA Evaluation
  if (criteria.minCgpa === null || criteria.minCgpa === undefined) {
    breakdown.push({
      criterion: 'cgpa',
      label: 'Minimum CGPA',
      studentValue: student.cgpa,
      requiredValue: 'No minimum cutoff',
      status: 'eligible',
      reason: 'No minimum CGPA requirement stated.',
    });
  } else if (student.cgpa === null || student.cgpa === undefined) {
    hasUnableToDetermine = true;
    breakdown.push({
      criterion: 'cgpa',
      label: 'Minimum CGPA',
      studentValue: null,
      requiredValue: `${criteria.minCgpa} CGPA`,
      status: 'unable_to_determine',
      reason: 'Your profile does not state your current CGPA.',
    });
  } else {
    if (student.cgpa >= criteria.minCgpa) {
      breakdown.push({
        criterion: 'cgpa',
        label: 'Minimum CGPA',
        studentValue: `${student.cgpa}`,
        requiredValue: `${criteria.minCgpa} minimum`,
        status: 'eligible',
        reason: `Your CGPA (${student.cgpa}) meets the minimum threshold (${criteria.minCgpa}).`,
      });
    } else {
      hasIneligible = true;
      breakdown.push({
        criterion: 'cgpa',
        label: 'Minimum CGPA',
        studentValue: `${student.cgpa}`,
        requiredValue: `${criteria.minCgpa} minimum`,
        status: 'ineligible',
        reason: `Your CGPA (${student.cgpa}) is below the required ${criteria.minCgpa}.`,
      });
    }
  }

  // 5. Backlogs Evaluation
  if (criteria.allowsBacklogs) {
    breakdown.push({
      criterion: 'backlogs',
      label: 'Backlog Policy',
      studentValue: student.hasActiveBacklogs ? 'Has active backlogs' : 'No active backlogs',
      requiredValue: 'Backlogs allowed',
      status: 'eligible',
      reason: 'Employer permits active backlogs.',
    });
  } else {
    if (student.hasActiveBacklogs) {
      hasIneligible = true;
      breakdown.push({
        criterion: 'backlogs',
        label: 'Backlog Policy',
        studentValue: 'Has active backlogs',
        requiredValue: 'Zero active backlogs',
        status: 'ineligible',
        reason: 'Employer requires 0 active backlogs.',
      });
    } else {
      breakdown.push({
        criterion: 'backlogs',
        label: 'Backlog Policy',
        studentValue: 'No active backlogs',
        requiredValue: 'Zero active backlogs',
        status: 'eligible',
        reason: 'You have no active backlogs.',
      });
    }
  }

  // Determine Overall
  let overallResult: EligibilityResult;
  let summaryNote: string;

  if (hasIneligible) {
    overallResult = 'ineligible';
    summaryNote = 'You do not meet one or more specified eligibility criteria for this role.';
  } else if (hasUnableToDetermine) {
    overallResult = 'unable_to_determine';
    summaryNote = 'Some eligibility criteria could not be evaluated because information is missing in your student profile.';
  } else {
    overallResult = 'eligible';
    summaryNote = 'You meet all stated eligibility criteria for this opportunity.';
  }

  return {
    overallResult,
    breakdown,
    summaryNote,
  };
}
