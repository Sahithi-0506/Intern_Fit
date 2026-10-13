import { URL } from 'url';
import { UrlRiskAssessment, RiskLevel } from '@internfit/shared';
import { safeInspectUrl, SecurityInspectionError } from '../security/ssrfGuard';
import { v4 as uuidv4 } from 'uuid';

// List of known trusted employer and careers ATS platforms
export const TRUSTED_CAREERS_DOMAINS = [
  'careers.google.com',
  'google.com',
  'careers.microsoft.com',
  'microsoft.com',
  'amazon.jobs',
  'amazon.in',
  'tcs.com',
  'infosys.com',
  'wipro.com',
  'flipkartcareers.com',
  'flipkart.com',
  'swiggy.com',
  'myworkdayjobs.com',
  'greenhouse.io',
  'lever.co',
  'smartrecruiters.com',
  'taleo.net',
  'darwinbox.in',
  'unstop.com',
  'naukri.com',
  'linkedin.com',
];

// Suspicious trigger patterns
const SUSPICIOUS_PAYMENT_PATTERNS = [
  { pattern: /registration\s+fee/i, reason: 'Mentions "registration fee" or entry charge for internship' },
  { pattern: /security\s+deposit/i, reason: 'Mentions "security deposit" required prior to joining' },
  { pattern: /pay\s+(?:rs|inr|₹|\$)\s*\d+/i, reason: 'Explicit payment demanded before selection' },
  { pattern: /training\s+charges/i, reason: 'Mentions upfront training charges or course fee' },
  { pattern: /purchase\s+(?:laptop|equipment|kit)/i, reason: 'Demands purchase of company laptop/equipment' },
  { pattern: /bank\s+account\s+details|upi\s+pin|atm\s+card/i, reason: 'Demands confidential banking credentials or UPI up-front' },
  { pattern: /telegram\s+(?:channel|group|dm|chat)|whatsapp\s+only/i, reason: 'Directs official recruitment communication solely to unofficial Telegram/WhatsApp groups' },
  { pattern: /earn\s+(?:₹|rs\.|inr)\s*(?:[5-9]\d|\d{3}),?\d{3}\s*(?:daily|per\s+day|weekly)/i, reason: 'Unrealistic or sensational compensation promises for student work' },
];

export async function checkUrlRisk(rawUrl: string, userId: string | null = null): Promise<UrlRiskAssessment> {
  const normalizedUrl = rawUrl.trim();
  let parsed: URL;

  try {
    parsed = new URL(normalizedUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const hostname = parsed.hostname.toLowerCase();
  const warningSigns: string[] = [];
  const positiveIndicators: string[] = [];
  const recommendations: string[] = [
    'Always verify job postings directly on the company’s official corporate website career portal.',
    'Never pay any "registration fee", "laptop deposit", or "documentation fee" for an internship.',
    'Do not share sensitive identification documents (Aadhaar, PAN, Bank Details) through unofficial forms or chat apps.',
  ];

  let evidenceScore = 50; // Starting baseline
  let riskLevel: RiskLevel = 'moderate_risk';
  let finalDestinationUrl: string | null = null;
  let officialSourceEvidence: string | null = null;
  let missingEvidenceNotes: string | null = null;

  // 1. Technical URL / Domain Analysis
  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    warningSigns.push('URL does not use secure HTTPS encryption (uses plain unencrypted HTTP).');
    evidenceScore += 20;
  } else {
    positiveIndicators.push('Connection uses valid TLS/HTTPS protocol.');
    evidenceScore -= 10;
  }

  // Check known trusted domains
  const isTrustedDomain = TRUSTED_CAREERS_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  if (isTrustedDomain) {
    positiveIndicators.push(`Domain (${hostname}) matches a verified company careers portal or accredited recruitment platform.`);
    officialSourceEvidence = `Hostname verified as belonging to recognized domain: ${hostname}`;
    evidenceScore -= 30;
  } else {
    // Check for suspicious typosquatting or subdomains
    if (hostname.includes('google') || hostname.includes('microsoft') || hostname.includes('amazon') || hostname.includes('infosys') || hostname.includes('tcs')) {
      warningSigns.push(`Domain contains brand name (${hostname}) but is not an authorized official domain. High risk of impersonation.`);
      evidenceScore += 45;
    }
  }

  // Check for suspicious TLDs often abused in phishing
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.buzz'];
  if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
    warningSigns.push(`Domain uses a high-risk or free top-level domain (${hostname}) commonly associated with temporary phishing links.`);
    evidenceScore += 25;
  }

  // 2. Network & Content Inspection via SSRF Guard
  try {
    const inspection = await safeInspectUrl(normalizedUrl, { timeoutMs: 5000, maxBytes: 512 * 1024 });
    finalDestinationUrl = inspection.finalUrl;

    if (inspection.redirectChain.length > 0) {
      if (inspection.redirectChain.length > 2) {
        warningSigns.push(`URL underwent multiple redirects (${inspection.redirectChain.length} hops) before reaching destination.`);
        evidenceScore += 10;
      }
      const finalHost = new URL(inspection.finalUrl).hostname.toLowerCase();
      if (finalHost !== hostname) {
        warningSigns.push(`Destination domain redirects across origins to: ${finalHost}`);
      }
    }

    // Inspect page text content for fraudulent triggers
    const bodyText = inspection.body;
    for (const rule of SUSPICIOUS_PAYMENT_PATTERNS) {
      if (rule.pattern.test(bodyText)) {
        warningSigns.push(`Suspicious terminology detected in page content: ${rule.reason}`);
        evidenceScore += 30;
      }
    }

    if (inspection.statusCode === 200) {
      positiveIndicators.push('Destination server is actively responding with HTTP 200 OK.');
    } else {
      warningSigns.push(`Destination server returned non-success status code HTTP ${inspection.statusCode}.`);
    }
  } catch (err: any) {
    if (err instanceof SecurityInspectionError) {
      if (err.code === 'PRIVATE_IP_BLOCKED' || err.code === 'LOOPBACK_BLOCKED') {
        warningSigns.push(`CRITICAL SECURITY ALERT: URL resolves to prohibited private or loopback IP address (${err.message}).`);
        evidenceScore = 95;
      } else {
        missingEvidenceNotes = `Network inspection could not be completed safely: ${err.message}`;
      }
    } else {
      missingEvidenceNotes = `Could not safely fetch URL content: ${err.message}. The site may be behind login authentication, down, or blocking inspection.`;
    }
  }

  // Clamp evidence score between 5 and 95
  evidenceScore = Math.max(5, Math.min(95, evidenceScore));

  // Determine Risk Category
  if (missingEvidenceNotes && positiveIndicators.length === 0 && warningSigns.length === 0) {
    riskLevel = 'insufficient_evidence';
  } else if (evidenceScore >= 60 || warningSigns.some(w => w.includes('CRITICAL') || w.includes('impersonation') || w.includes('payment'))) {
    riskLevel = 'high_risk';
  } else if (evidenceScore >= 40) {
    riskLevel = 'moderate_risk';
  } else {
    riskLevel = 'lower_risk';
  }

  return {
    id: uuidv4(),
    submittedUrl: normalizedUrl,
    normalizedUrl,
    destinationDomain: hostname,
    finalDestinationUrl,
    riskLevel,
    evidenceScore,
    warningSigns,
    positiveIndicators,
    officialSourceEvidence,
    missingEvidenceNotes,
    isReviewedByPlacementCell: false,
    recommendations,
    userId,
    createdAt: new Date().toISOString(),
  };
}
