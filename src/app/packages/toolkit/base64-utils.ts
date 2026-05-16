function bytesToBinary(bytes: Uint8Array): string {
  return bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
}

function binaryToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(plainText: string): string {
  const encoder = new TextEncoder();
  return btoa(bytesToBinary(encoder.encode(plainText)));
}

export function decodeBase64(encodedValue: string): string {
  const decoder = new TextDecoder();
  const binary = atob(encodedValue);
  return decoder.decode(binaryToBytes(binary));
}
