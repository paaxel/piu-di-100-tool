export function jsonToCsv(input: unknown): string {
  if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
    input = [input];
  }
  if (!Array.isArray(input)) {
    throw new Error('JSON must be an array or object');
  }
  const rows = input as Array<Record<string, unknown>>;
  const headerSet = new Set<string>();
  for (const r of rows) {
    if (r && typeof r === 'object') Object.keys(r).forEach((k) => headerSet.add(k));
  }
  const headers = [...headerSet];
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => escape((r ?? {})[h])).join(','));
  }
  return lines.join('\n');
}

export function csvToJson(csv: string): Array<Record<string, string>> {
  const text = (csv || '').replace(/\r\n?/g, '\n');
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cur.push(field); field = '';
    } else if (ch === '\n') {
      cur.push(field); rows.push(cur); cur = []; field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || cur.length) { cur.push(field); rows.push(cur); }
  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).filter((r) => r.length && !(r.length === 1 && r[0] === '')).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = r[idx] ?? ''));
    return obj;
  });
}
