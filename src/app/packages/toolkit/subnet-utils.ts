export interface SubnetAnalysis {
  ipAddress: string;
  prefixLength: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
}

export interface MaskInfo {
  prefixLength: number;
  subnetMask: string;
}

export interface MaskInputIssue {
  code: 'invalid-prefix' | 'invalid-format' | 'invalid-octet' | 'non-contiguous';
  value: string;
  invalidOctet?: string;
  binaryOctet?: string;
}

const VALID_MASK_OCTETS = new Set([255, 254, 252, 248, 240, 224, 192, 128, 0]);

function isValidOctet(value: string): boolean {
  return /^(0|[1-9]\d{0,2})$/.test(value) && Number(value) <= 255;
}

export function parseIpv4(value: string): number | null {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (const part of parts) {
    if (!isValidOctet(part)) return null;
    result = ((result << 8) | Number(part)) >>> 0;
  }

  return result;
}

export function intToIpv4(value: number): string {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join('.');
}

export function prefixToMask(prefixLength: number): string | null {
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    return null;
  }

  const maskInt = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return intToIpv4(maskInt);
}

export function maskToPrefix(mask: string): number | null {
  const maskInt = parseIpv4(mask);
  if (maskInt === null) return null;

  const inverse = (~maskInt) >>> 0;
  if (inverse !== 0 && ((inverse + 1) & inverse) !== 0) {
    return null;
  }

  let prefixLength = 0;
  let bit = 0x80000000;
  while (bit !== 0 && (maskInt & bit) !== 0) {
    prefixLength += 1;
    bit >>>= 1;
  }

  return prefixLength;
}

export function explainMaskInputIssue(maskOrPrefix: string): MaskInputIssue | null {
  const trimmed = maskOrPrefix.trim();
  if (trimmed === '') return null;

  if (/^\/?\d+$/.test(trimmed)) {
    const prefixLength = Number(trimmed.replace('/', ''));
    if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
      return {
        code: 'invalid-prefix',
        value: trimmed,
      };
    }

    return null;
  }

  const parts = trimmed.split('.');
  if (parts.length !== 4) {
    return {
      code: 'invalid-format',
      value: trimmed,
    };
  }

  for (const part of parts) {
    if (!isValidOctet(part)) {
      return {
        code: 'invalid-format',
        value: trimmed,
      };
    }

    const octet = Number(part);
    if (!VALID_MASK_OCTETS.has(octet)) {
      return {
        code: 'invalid-octet',
        value: trimmed,
        invalidOctet: part,
        binaryOctet: octet.toString(2).padStart(8, '0'),
      };
    }
  }

  let seenZeroOrPartial = false;
  for (const part of parts) {
    const octet = Number(part);
    if (octet === 255) {
      if (seenZeroOrPartial) {
        return {
          code: 'non-contiguous',
          value: trimmed,
        };
      }
      continue;
    }

    if (octet === 0) {
      seenZeroOrPartial = true;
      continue;
    }

    if (seenZeroOrPartial) {
      return {
        code: 'non-contiguous',
        value: trimmed,
      };
    }

    seenZeroOrPartial = true;
  }

  return null;
}

export function normalizeMaskInput(maskOrPrefix: string): MaskInfo | null {
  const trimmed = maskOrPrefix.trim();
  if (trimmed === '') return null;

  if (/^\/?\d{1,2}$/.test(trimmed)) {
    const prefixLength = Number(trimmed.replace('/', ''));
    const subnetMask = prefixToMask(prefixLength);
    if (!subnetMask) return null;
    return { prefixLength, subnetMask };
  }

  const prefixLength = maskToPrefix(trimmed);
  if (prefixLength === null) return null;

  return {
    prefixLength,
    subnetMask: trimmed,
  };
}

function analyze(ipInt: number, prefixLength: number): SubnetAnalysis {
  const maskInt = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const totalAddresses = 2 ** (32 - prefixLength);
  const usableHosts = prefixLength >= 31 ? totalAddresses : Math.max(totalAddresses - 2, 0);

  let firstHostInt = networkInt;
  let lastHostInt = broadcastInt;
  if (prefixLength <= 30) {
    firstHostInt = (networkInt + 1) >>> 0;
    lastHostInt = (broadcastInt - 1) >>> 0;
  }

  return {
    ipAddress: intToIpv4(ipInt),
    prefixLength,
    subnetMask: intToIpv4(maskInt),
    wildcardMask: intToIpv4(wildcardInt),
    networkAddress: intToIpv4(networkInt),
    broadcastAddress: intToIpv4(broadcastInt),
    firstHost: intToIpv4(firstHostInt),
    lastHost: intToIpv4(lastHostInt),
    totalAddresses,
    usableHosts,
  };
}

export function analyzeCidr(value: string): SubnetAnalysis | null {
  const match = value.trim().match(/^([^/]+)\s*\/\s*(\d{1,2})$/);
  if (!match) return null;

  const ipInt = parseIpv4(match[1]);
  const prefixLength = Number(match[2]);
  if (ipInt === null || !Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    return null;
  }

  return analyze(ipInt, prefixLength);
}

export function analyzeIpAndMask(ipAddress: string, maskOrPrefix: string): SubnetAnalysis | null {
  const ipInt = parseIpv4(ipAddress);
  const maskInfo = normalizeMaskInput(maskOrPrefix);
  if (ipInt === null || !maskInfo) {
    return null;
  }

  return analyze(ipInt, maskInfo.prefixLength);
}