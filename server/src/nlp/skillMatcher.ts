import { normalizeSkill } from './skillsTaxonomy';

export interface SkillMatchResult {
  matchedSkills: string[];
  missingSkills: string[];
  preferredMatchedSkills: string[];
  uncertainSkills: string[];
  skillCoveragePercentage: number;
  learningRecommendations: string[];
}

export function matchSkills(
  detectedSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): SkillMatchResult {
  const detectedNormalized = new Set(detectedSkills.map(s => normalizeSkill(s).toLowerCase()));

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const uncertainSkills: string[] = [];

  for (const rawReq of requiredSkills) {
    const normalized = normalizeSkill(rawReq);
    if (detectedNormalized.has(normalized.toLowerCase())) {
      matchedSkills.push(normalized);
    } else {
      missingSkills.push(normalized);
    }
  }

  const preferredMatchedSkills: string[] = [];
  for (const rawPref of preferredSkills) {
    const normalized = normalizeSkill(rawPref);
    if (detectedNormalized.has(normalized.toLowerCase())) {
      preferredMatchedSkills.push(normalized);
    }
  }

  // Calculate coverage percentage
  let coveragePercentage = 100;
  if (requiredSkills.length > 0) {
    coveragePercentage = Math.round((matchedSkills.length / requiredSkills.length) * 1000) / 10;
  }

  // Generate learning recommendations for missing skills
  const learningRecommendations: string[] = [];
  for (const skill of missingSkills) {
    learningRecommendations.push(generateRecommendation(skill));
  }

  return {
    matchedSkills,
    missingSkills,
    preferredMatchedSkills,
    uncertainSkills,
    skillCoveragePercentage: coveragePercentage,
    learningRecommendations,
  };
}

function generateRecommendation(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes('java')) {
    return 'Practice core Java object-oriented principles, Collections framework, and multi-threading on LeetCode/HackerRank.';
  }
  if (s.includes('python')) {
    return 'Strengthen Python data structures, list comprehensions, and build a project with FastAPI or Flask.';
  }
  if (s.includes('react')) {
    return 'Build an interactive React application demonstrating hooks (useState, useEffect, useMemo) and state management.';
  }
  if (s.includes('sql')) {
    return 'Practice complex SQL queries involving GROUP BY, HAVING, subqueries, and multi-table INNER/LEFT JOINs.';
  }
  if (s.includes('docker')) {
    return 'Containerize a local full-stack project using Docker and write a multi-stage Dockerfile.';
  }
  if (s.includes('data structures') || s.includes('algorithms')) {
    return 'Solve 2-3 algorithmic problems daily covering Binary Trees, Hash Maps, Dynamic Programming, and Two Pointers.';
  }
  if (s.includes('cloud') || s.includes('aws') || s.includes('azure')) {
    return 'Deploy a free-tier cloud project exploring EC2/App Service, S3 blob storage, and IAM security policies.';
  }
  return `Review core fundamentals of ${skill} and build a focused mini-project showcasing real-world usage on GitHub.`;
}
