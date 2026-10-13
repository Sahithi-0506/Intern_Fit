import dns from 'dns/promises';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export interface SafeFetchResult {
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  redirectChain: string[];
  resolvedIps: string[];
}

export class SecurityInspectionError extends Error {
  constructor(message: string, public readonly code: string = 'SSRF_BLOCKED') {
    super(message);
    this.name = 'SecurityInspectionError';
  }
}

/**
 * Validates whether an IPv4 address belongs to a prohibited or private range.
 */
export function isProhibitedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 - Current network
  if (a === 0) return true;

  // 10.0.0.0/8 - Private network
  if (a === 10) return true;

  // 100.64.0.0/10 - Shared address space (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 - Loopback
  if (a === 127) return true;

  // 169.254.0.0/16 - Link-local / Cloud metadata (AWS, GCP, Azure 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 - Private network (172.16.0.0 to 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 - IETF Protocol Assignments
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 - Documentation (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.168.0.0/16 - Private network
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 - Benchmarking
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 - Documentation (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 - Documentation (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 - Multicast
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 - Reserved for future use
  if (a >= 240) return true;

  // 255.255.255.255 - Broadcast
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Validates whether an IPv6 address belongs to a prohibited or private range.
 */
export function isProhibitedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback (::1) & Unspecified (::)
  if (normalized === '::1' || normalized === '::') return true;

  // IPv4-mapped IPv6 (::ffff:192.0.2.1)
  if (normalized.startsWith('::ffff:')) {
    const v4 = normalized.substring(7);
    return isProhibitedIPv4(v4);
  }

  // Unique Local Address (fc00::/7)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-Local (fe80::/10)
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;

  // Multicast (ff00::/8)
  if (normalized.startsWith('ff')) return true;

  return false;
}

/**
 * Resolves all IP addresses for a hostname and verifies none are prohibited.
 */
export async function validateHostnameSecurity(hostname: string): Promise<string[]> {
  // Reject plain localhost immediately
  if (hostname.toLowerCase() === 'localhost') {
    throw new SecurityInspectionError('Requests to localhost are prohibited', 'LOOPBACK_BLOCKED');
  }

  // Check if hostname is an IPv4 literal
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isProhibitedIPv4(hostname)) {
      throw new SecurityInspectionError(`Target IP ${hostname} is in a private or restricted address space`, 'PRIVATE_IP_BLOCKED');
    }
    return [hostname];
  }

  // Resolve DNS records
  const resolvedIps: string[] = [];
  try {
    const v4 = await dns.resolve4(hostname).catch(() => []);
    const v6 = await dns.resolve6(hostname).catch(() => []);
    resolvedIps.push(...v4, ...v6);
  } catch (err: any) {
    throw new SecurityInspectionError(`Failed to resolve DNS for ${hostname}: ${err.message}`, 'DNS_RESOLUTION_FAILED');
  }

  if (resolvedIps.length === 0) {
    throw new SecurityInspectionError(`No DNS records found for host ${hostname}`, 'DOMAIN_NOT_FOUND');
  }

  for (const ip of resolvedIps) {
    if (ip.includes(':')) {
      if (isProhibitedIPv6(ip)) {
        throw new SecurityInspectionError(`Resolved IPv6 address ${ip} is in a restricted range`, 'PRIVATE_IP_BLOCKED');
      }
    } else {
      if (isProhibitedIPv4(ip)) {
        throw new SecurityInspectionError(`Resolved IPv4 address ${ip} is in a restricted range`, 'PRIVATE_IP_BLOCKED');
      }
    }
  }

  return resolvedIps;
}

/**
 * Safely fetches a URL with full SSRF guard, redirect inspection, timeout, and response size limits.
 */
export async function safeInspectUrl(
  initialUrl: string,
  options: { maxRedirects?: number; timeoutMs?: number; maxBytes?: number } = {}
): Promise<SafeFetchResult> {
  const maxRedirects = options.maxRedirects ?? 5;
  const timeoutMs = options.timeoutMs ?? 6000;
  const maxBytes = options.maxBytes ?? 512 * 1024; // 512KB

  const redirectChain: string[] = [];
  const visitedUrls = new Set<string>();
  let currentUrl = initialUrl;
  let allResolvedIps: string[] = [];

  for (let hop = 0; hop <= maxRedirects; hop++) {
    // 1. Parse URL & check protocol
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new SecurityInspectionError(`Invalid URL format: ${currentUrl}`, 'INVALID_URL');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new SecurityInspectionError(`Prohibited protocol: ${parsed.protocol}. Only http: and https: allowed.`, 'PROTOCOL_BLOCKED');
    }

    // 2. Loop detection
    if (visitedUrls.has(currentUrl)) {
      throw new SecurityInspectionError(`Redirect loop detected at ${currentUrl}`, 'REDIRECT_LOOP');
    }
    visitedUrls.add(currentUrl);

    // 3. DNS and IP verification
    const resolved = await validateHostnameSecurity(parsed.hostname);
    allResolvedIps = [...allResolvedIps, ...resolved];

    // 4. Perform single-hop request
    const hopResult = await new Promise<{
      statusCode: number;
      headers: http.IncomingHttpHeaders;
      body: string;
      redirectLocation?: string;
    }>((resolve, reject) => {
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        parsed,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'InternFit-SafetyChecker/1.0 (+https://internfit.edu/safety; placement verification)',
            'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: timeoutMs,
        },
        (res) => {
          const statusCode = res.statusCode || 0;
          const headers = res.headers;

          // Check redirect status
          if (statusCode >= 300 && statusCode < 400 && headers.location) {
            const redirectUrl = new URL(headers.location, currentUrl).toString();
            res.resume(); // discard body
            resolve({ statusCode, headers, body: '', redirectLocation: redirectUrl });
            return;
          }

          // Validate Content-Type
          const contentType = headers['content-type'] || '';
          const isAllowedType =
            contentType.includes('text/html') ||
            contentType.includes('application/xhtml+xml') ||
            contentType.includes('text/plain') ||
            contentType.includes('text/');

          if (!isAllowedType && statusCode === 200) {
            res.resume();
            reject(new SecurityInspectionError(`Content-type "${contentType}" is not inspectable text or HTML`, 'UNSUPPORTED_MEDIA_TYPE'));
            return;
          }

          let data = '';
          let totalBytes = 0;

          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            totalBytes += Buffer.byteLength(chunk, 'utf8');
            if (totalBytes > maxBytes) {
              res.destroy();
              reject(new SecurityInspectionError(`Response exceeds max allowed inspection limit (${maxBytes} bytes)`, 'CONTENT_TOO_LARGE'));
              return;
            }
            data += chunk;
          });

          res.on('end', () => {
            resolve({ statusCode, headers, body: data });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new SecurityInspectionError(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT'));
      });

      req.on('error', (err) => {
        reject(new SecurityInspectionError(`Network error while inspecting URL: ${err.message}`, 'NETWORK_ERROR'));
      });

      req.end();
    });

    if (hopResult.redirectLocation) {
      redirectChain.push(currentUrl);
      currentUrl = hopResult.redirectLocation;
    } else {
      // Completed chain
      const safeHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(hopResult.headers)) {
        if (typeof v === 'string') safeHeaders[k] = v;
      }

      return {
        finalUrl: currentUrl,
        statusCode: hopResult.statusCode,
        headers: safeHeaders,
        body: hopResult.body,
        redirectChain,
        resolvedIps: allResolvedIps,
      };
    }
  }

  throw new SecurityInspectionError(`Exceeded maximum allowed redirect hops (${maxRedirects})`, 'MAX_REDIRECTS_EXCEEDED');
}
