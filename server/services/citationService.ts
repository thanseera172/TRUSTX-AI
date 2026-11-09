import { CitationVerification } from '../../src/types/index.ts';

/**
 * MODULE 4: Research Citation Verification
 * Connects to Crossref REST API and OpenAlex API
 */

interface RawCitationCandidate {
  raw: string;
  doi?: string;
  title?: string;
  author?: string;
  year?: string;
}

// Heuristic pattern extractor for academic citations
export function extractCitationCandidates(text: string): RawCitationCandidate[] {
  const candidates: RawCitationCandidate[] = [];

  // Match DOIs (e.g., 10.1000/182, 10.1038/nature12373, etc.)
  const doiRegex = /\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/g;
  let match;
  while ((match = doiRegex.exec(text)) !== null) {
    candidates.push({
      raw: match[0],
      doi: match[1],
    });
  }

  // Split lines or bracketed references [1], (Smith et al., 2021), etc.
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 25);
  for (const line of lines) {
    // Check if line looks like an academic citation
    const hasYear = /\b(19\d\d|20\d\d)\b/.test(line);
    const hasAuthorPattern = /[A-Z][a-z]+(\s+et\s+al\.|,\s+[A-Z]\.|\s+and\s+[A-Z][a-z]+)/.test(line);
    const hasJournalWords = /(Journal|Transactions|Proceedings|Conference|IEEE|Nature|Science|ACM|arXiv)/i.test(line);

    if ((hasYear && hasAuthorPattern) || (hasYear && hasJournalWords) || line.startsWith('[') || line.toLowerCase().includes('doi.org/')) {
      // Avoid duplicate DOI entries
      if (!candidates.some((c) => c.raw.includes(line) || line.includes(c.raw))) {
        // Extract title heuristics (often inside quotes or before year)
        const quoteMatch = line.match(/["“]([^"”]+)["”]/);
        const title = quoteMatch ? quoteMatch[1] : undefined;
        const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
        const authorMatch = line.match(/^([A-Z][a-zA-Z\s.,]+?)(?=\s*\(?\d{4}|\s*["“])/);

        candidates.push({
          raw: line,
          title,
          author: authorMatch ? authorMatch[1].trim() : undefined,
          year: yearMatch ? yearMatch[1] : undefined,
        });
      }
    }
  }

  return candidates;
}

/**
 * Calculates string similarity between two titles using token Jaccard similarity
 */
function titleSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const t1 = new Set(normalize(s1));
  const t2 = new Set(normalize(s2));

  if (t1.size === 0 || t2.size === 0) return 0;

  const intersection = new Set([...t1].filter((x) => t2.has(x)));
  const union = new Set([...t1, ...t2]);

  return intersection.size / union.size;
}

/**
 * Queries Crossref REST API
 */
async function queryCrossref(candidate: RawCitationCandidate) {
  try {
    let url = '';
    if (candidate.doi) {
      url = `https://api.crossref.org/works/${encodeURIComponent(candidate.doi)}`;
    } else {
      const query = candidate.title || candidate.raw.slice(0, 150);
      url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=1`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TRUSTX-AI/1.0 (mailto:verify@trustx-ai.org)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    const item = candidate.doi ? data.message : data.message?.items?.[0];
    if (!item) return null;

    const title = Array.isArray(item.title) ? item.title[0] : item.title || '';
    const authors = Array.isArray(item.author)
      ? item.author.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', ')
      : '';
    const year =
      item.published?.['date-parts']?.[0]?.[0]?.toString() ||
      item['published-print']?.['date-parts']?.[0]?.[0]?.toString() ||
      '';
    const doi = item.DOI || '';
    const referenceUrl = item.URL || (doi ? `https://doi.org/${doi}` : '');

    return {
      title,
      authors,
      year,
      doi,
      url: referenceUrl,
      source: 'Crossref' as const,
    };
  } catch {
    return null;
  }
}

/**
 * Queries OpenAlex API as complementary academic metadata provider
 */
async function queryOpenAlex(candidate: RawCitationCandidate) {
  try {
    const query = candidate.title || candidate.doi || candidate.raw.slice(0, 100);
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TRUSTX-AI/1.0 (mailto:verify@trustx-ai.org)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const item = data.results?.[0];
    if (!item) return null;

    const title = item.title || '';
    const authors = (item.authorships || [])
      .map((a: any) => a.author?.display_name)
      .filter(Boolean)
      .join(', ');
    const year = item.publication_year ? String(item.publication_year) : '';
    const doi = item.doi ? item.doi.replace('https://doi.org/', '') : '';
    const referenceUrl = item.doi || (item.id ? item.id : '');

    return {
      title,
      authors,
      year,
      doi,
      url: referenceUrl,
      source: 'OpenAlex' as const,
    };
  } catch {
    return null;
  }
}

/**
 * Verifies academic citations against Crossref and OpenAlex
 */
export async function verifyCitations(text: string, manualCitations?: string[]): Promise<CitationVerification[]> {
  const candidates: RawCitationCandidate[] = [];

  if (manualCitations && manualCitations.length > 0) {
    for (const c of manualCitations) {
      candidates.push({ raw: c });
    }
  } else {
    candidates.push(...extractCitationCandidates(text));
  }

  if (candidates.length === 0) {
    return [];
  }

  const results: CitationVerification[] = [];

interface AcademicMetadata {
  title: string;
  authors: string;
  year: string;
  doi: string;
  url: string;
  source: 'Crossref' | 'OpenAlex';
}

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const citationId = `CIT-${String(i + 1).padStart(3, '0')}`;

    // Try Crossref first, then OpenAlex
    let meta: AcademicMetadata | null = await queryCrossref(candidate);
    if (!meta) {
      meta = await queryOpenAlex(candidate);
    }

    if (!meta) {
      results.push({
        citationId,
        submittedCitation: candidate.raw,
        status: 'NOT_FOUND',
        mismatchDetails: 'No indexed publication matched this citation across Crossref and OpenAlex archives.',
        databaseSource: 'None',
      });
      continue;
    }

    // Compare metadata
    const sim = candidate.title ? titleSimilarity(candidate.title, meta.title) : titleSimilarity(candidate.raw, meta.title);
    const submittedYearMatch = candidate.raw.match(/\b(19\d\d|20\d\d)\b/);
    const submittedYear = candidate.year || (submittedYearMatch ? submittedYearMatch[1] : null);

    const yearDiff = submittedYear && meta.year && submittedYear !== meta.year;
    const hasDoiMismatch = candidate.doi && meta.doi && candidate.doi.toLowerCase() !== meta.doi.toLowerCase();

    if (sim >= 0.55 && !yearDiff && !hasDoiMismatch) {
      results.push({
        citationId,
        submittedCitation: candidate.raw,
        status: 'VERIFIED',
        retrievedTitle: meta.title,
        retrievedAuthors: meta.authors,
        retrievedYear: meta.year,
        retrievedDoi: meta.doi,
        retrievedUrl: meta.url,
        databaseSource: meta.source,
      });
    } else if (sim >= 0.25 || yearDiff || hasDoiMismatch) {
      const mismatches: string[] = [];
      if (yearDiff) mismatches.push(`Year mismatch: Submitted "${submittedYear}", retrieved official "${meta.year}"`);
      if (hasDoiMismatch) mismatches.push(`DOI mismatch: Submitted "${candidate.doi}", official "${meta.doi}"`);
      if (sim < 0.55) mismatches.push(`Title variance: "${meta.title}" differs significantly from submitted reference`);

      results.push({
        citationId,
        submittedCitation: candidate.raw,
        status: 'METADATA_MISMATCH',
        retrievedTitle: meta.title,
        retrievedAuthors: meta.authors,
        retrievedYear: meta.year,
        retrievedDoi: meta.doi,
        retrievedUrl: meta.url,
        mismatchDetails: mismatches.join('. '),
        databaseSource: meta.source,
      });
    } else {
      results.push({
        citationId,
        submittedCitation: candidate.raw,
        status: 'NOT_FOUND',
        mismatchDetails: 'Could not reliably match citation metadata to a verified peer-reviewed record.',
        databaseSource: meta.source,
      });
    }
  }

  return results;
}
