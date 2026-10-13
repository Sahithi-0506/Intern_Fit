import { describe, it, expect } from 'vitest';
import { isProhibitedIPv4, isProhibitedIPv6 } from '../src/security/ssrfGuard';

describe('SSRF Guard & Prohibited IP Address Filtering', () => {
  it('should block IPv4 loopback addresses (127.0.0.0/8)', () => {
    expect(isProhibitedIPv4('127.0.0.1')).toBe(true);
    expect(isProhibitedIPv4('127.0.0.2')).toBe(true);
    expect(isProhibitedIPv4('127.255.255.255')).toBe(true);
  });

  it('should block IPv4 private address ranges (RFC 1918)', () => {
    // 10.0.0.0/8
    expect(isProhibitedIPv4('10.0.0.1')).toBe(true);
    expect(isProhibitedIPv4('10.254.1.99')).toBe(true);

    // 172.16.0.0/12
    expect(isProhibitedIPv4('172.16.0.1')).toBe(true);
    expect(isProhibitedIPv4('172.31.255.255')).toBe(true);
    expect(isProhibitedIPv4('172.32.0.1')).toBe(false); // public

    // 192.168.0.0/16
    expect(isProhibitedIPv4('192.168.1.1')).toBe(true);
    expect(isProhibitedIPv4('192.168.100.254')).toBe(true);
  });

  it('should block AWS / GCP / Azure Cloud Metadata IP (169.254.169.254)', () => {
    expect(isProhibitedIPv4('169.254.169.254')).toBe(true);
    expect(isProhibitedIPv4('169.254.0.1')).toBe(true); // Link-local
  });

  it('should block Broadcast and Reserved IPs', () => {
    expect(isProhibitedIPv4('0.0.0.0')).toBe(true);
    expect(isProhibitedIPv4('255.255.255.255')).toBe(true);
    expect(isProhibitedIPv4('224.0.0.1')).toBe(true); // Multicast
  });

  it('should allow legitimate public IPv4 internet addresses', () => {
    expect(isProhibitedIPv4('8.8.8.8')).toBe(false); // Google Public DNS
    expect(isProhibitedIPv4('1.1.1.1')).toBe(false); // Cloudflare DNS
    expect(isProhibitedIPv4('142.250.190.46')).toBe(false);
  });

  it('should block IPv6 loopback, unspecified, and private ranges', () => {
    expect(isProhibitedIPv6('::1')).toBe(true); // loopback
    expect(isProhibitedIPv6('::')).toBe(true); // unspecified
    expect(isProhibitedIPv6('fe80::1')).toBe(true); // link-local
    expect(isProhibitedIPv6('fc00::1')).toBe(true); // unique local
    expect(isProhibitedIPv6('::ffff:127.0.0.1')).toBe(true); // IPv4-mapped loopback
    expect(isProhibitedIPv6('::ffff:10.0.0.1')).toBe(true); // IPv4-mapped private
  });
});
