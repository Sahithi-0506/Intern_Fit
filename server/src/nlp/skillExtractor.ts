import { SKILLS_TAXONOMY, SkillDefinition } from './skillsTaxonomy';

export interface ExtractedSkillResult {
  canonicalName: string;
  matchedAlias: string;
  category: string;
  evidenceSnippet: string;
}

/**
 * Extracts technical and core CS skills from resume text using rule-based NLP and boundary matching.
 */
export function extractSkillsFromText(text: string): ExtractedSkillResult[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const results: ExtractedSkillResult[] = [];
  const foundCanonicals = new Set<string>();

  for (const def of SKILLS_TAXONOMY) {
    // Sort aliases by length descending so longer phrases match first (e.g. "javascript" before "js")
    const allPatterns = [def.canonicalName, ...def.aliases].sort((a, b) => b.length - a.length);

    for (const pattern of allPatterns) {
      // Escape regex special chars
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // For short words like C, C++, JS, ensure strict word boundaries
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');

      const match = text.match(regex);
      if (match && match.index !== undefined) {
        if (!foundCanonicals.has(def.canonicalName)) {
          foundCanonicals.add(def.canonicalName);

          // Extract surrounding snippet
          const matchStart = match.index;
          const snippetStart = Math.max(0, matchStart - 35);
          const snippetEnd = Math.min(text.length, matchStart + pattern.length + 35);
          let snippet = text.substring(snippetStart, snippetEnd).replace(/\s+/g, ' ').trim();
          if (snippetStart > 0) snippet = '...' + snippet;
          if (snippetEnd < text.length) snippet = snippet + '...';

          results.push({
            canonicalName: def.canonicalName,
            matchedAlias: pattern,
            category: def.category,
            evidenceSnippet: snippet,
          });
          break; // move to next skill definition
        }
      }
    }
  }

  return results;
}
