export function toOneLine(value: string): string {
  return (value || '')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function removeAllSpaces(value: string): string {
  return (value || '').replace(/\s+/g, '');
}

export function removeDoubleSpaces(value: string): string {
  return (value || '').replace(/ {2,}/g, ' ');
}

export interface StringStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  bytes: number;
}

export function computeStringStats(value: string): StringStats {
  const text = value || '';
  const encoder = new TextEncoder();
  return {
    characters: [...text].length,
    charactersNoSpaces: [...text].filter((c) => !/\s/.test(c)).length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
    bytes: encoder.encode(text).length,
  };
}

export function urlEncode(value: string): string {
  return encodeURIComponent(value || '');
}

export function urlDecode(value: string): string {
  return decodeURIComponent(value || '');
}
