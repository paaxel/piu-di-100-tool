import { describe, expect, it } from 'vitest';
import {
  analyzeCidr,
  analyzeIpAndMask,
  explainMaskInputIssue,
  maskToPrefix,
  normalizeMaskInput,
  prefixToMask,
} from './subnet-utils';

describe('subnet-utils', () => {
  it('converts prefix length to subnet mask', () => {
    expect(prefixToMask(24)).toBe('255.255.255.0');
    expect(prefixToMask(0)).toBe('0.0.0.0');
    expect(prefixToMask(33)).toBeNull();
  });

  it('converts dotted subnet mask to prefix length', () => {
    expect(maskToPrefix('255.255.255.0')).toBe(24);
    expect(maskToPrefix('255.255.252.0')).toBe(22);
    expect(maskToPrefix('255.0.255.0')).toBeNull();
  });

  it('normalizes dotted masks and numeric prefixes', () => {
    expect(normalizeMaskInput('/26')).toEqual({
      prefixLength: 26,
      subnetMask: '255.255.255.192',
    });
    expect(normalizeMaskInput('255.255.255.128')).toEqual({
      prefixLength: 25,
      subnetMask: '255.255.255.128',
    });
  });

  it('explains why an invalid mask octet is rejected', () => {
    expect(explainMaskInputIssue('255.255.246.0')).toEqual({
      code: 'invalid-octet',
      value: '255.255.246.0',
      invalidOctet: '246',
      binaryOctet: '11110110',
    });
  });

  it('explains non-contiguous masks even when octets look individually valid', () => {
    expect(explainMaskInputIssue('255.0.255.0')).toEqual({
      code: 'non-contiguous',
      value: '255.0.255.0',
    });
  });

  it('explains invalid prefixes', () => {
    expect(explainMaskInputIssue('/48')).toEqual({
      code: 'invalid-prefix',
      value: '/48',
    });
  });

  it('analyzes a CIDR block', () => {
    expect(analyzeCidr('192.168.1.42/24')).toEqual({
      ipAddress: '192.168.1.42',
      prefixLength: 24,
      subnetMask: '255.255.255.0',
      wildcardMask: '0.0.0.255',
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      totalAddresses: 256,
      usableHosts: 254,
    });
  });

  it('analyzes an IP address with dotted subnet mask', () => {
    expect(analyzeIpAndMask('10.0.5.7', '255.255.252.0')).toEqual({
      ipAddress: '10.0.5.7',
      prefixLength: 22,
      subnetMask: '255.255.252.0',
      wildcardMask: '0.0.3.255',
      networkAddress: '10.0.4.0',
      broadcastAddress: '10.0.7.255',
      firstHost: '10.0.4.1',
      lastHost: '10.0.7.254',
      totalAddresses: 1024,
      usableHosts: 1022,
    });
  });

  it('handles /32 ranges as a single available address', () => {
    expect(analyzeCidr('203.0.113.9/32')).toEqual({
      ipAddress: '203.0.113.9',
      prefixLength: 32,
      subnetMask: '255.255.255.255',
      wildcardMask: '0.0.0.0',
      networkAddress: '203.0.113.9',
      broadcastAddress: '203.0.113.9',
      firstHost: '203.0.113.9',
      lastHost: '203.0.113.9',
      totalAddresses: 1,
      usableHosts: 1,
    });
  });
});