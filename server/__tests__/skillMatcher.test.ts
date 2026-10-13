import { describe, it, expect } from 'vitest';
import { matchSkills } from '../src/nlp/skillMatcher';
import { extractSkillsFromText } from '../src/nlp/skillExtractor';
import { normalizeSkill } from '../src/nlp/skillsTaxonomy';

describe('Rule-based NLP Skill Matching & Coverage Math', () => {
  it('should normalize skill aliases to canonical taxonomy names', () => {
    expect(normalizeSkill('react.js')).toBe('React');
    expect(normalizeSkill('REACTJS')).toBe('React');
    expect(normalizeSkill('typescript')).toBe('TypeScript');
    expect(normalizeSkill('py')).toBe('Python');
    expect(normalizeSkill('dsa')).toBe('Data Structures');
  });

  it('should extract skills from resume text with boundary rules', () => {
    const resumeSample = `
      John Doe
      Proficient in Java, Spring Boot, and building REST APIs.
      Extensive database experience with MySQL and PostgreSQL.
      Worked on containerization using Docker and deployed on AWS EC2.
    `;
    const extracted = extractSkillsFromText(resumeSample);
    const skillNames = extracted.map(s => s.canonicalName);

    expect(skillNames).toContain('Java');
    expect(skillNames).toContain('Spring Boot');
    expect(skillNames).toContain('REST API');
    expect(skillNames).toContain('MySQL');
    expect(skillNames).toContain('PostgreSQL');
    expect(skillNames).toContain('Docker');
    expect(skillNames).toContain('AWS');
  });

  it('should calculate coverage % using the exact formula: (matched / total) * 100', () => {
    const detected = ['Java', 'SQL', 'Git'];
    const required = ['Java', 'SQL', 'Docker', 'Kubernetes']; // 2 of 4 matched
    const preferred = ['AWS'];

    const result = matchSkills(detected, required, preferred);

    expect(result.matchedSkills).toEqual(['Java', 'SQL']);
    expect(result.missingSkills).toEqual(['Docker', 'Kubernetes']);
    expect(result.skillCoveragePercentage).toBe(50.0);
  });

  it('should handle zero required skills gracefully without divide-by-zero error', () => {
    const detected = ['Python', 'Django'];
    const required: string[] = [];
    const preferred = ['Docker'];

    const result = matchSkills(detected, required, preferred);

    expect(result.skillCoveragePercentage).toBe(100.0);
    expect(result.missingSkills).toHaveLength(0);
  });

  it('should generate practical learning recommendations for missing skills', () => {
    const detected = ['HTML', 'CSS'];
    const required = ['React', 'TypeScript', 'SQL'];

    const result = matchSkills(detected, required, []);

    expect(result.learningRecommendations.length).toBe(3);
    expect(result.learningRecommendations.some(r => r.includes('React'))).toBe(true);
    expect(result.learningRecommendations.some(r => r.includes('SQL'))).toBe(true);
  });
});
