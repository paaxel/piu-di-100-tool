/**
 * Minimal JSON <-> YAML conversion. Supports plain scalars, strings, numbers,
 * booleans, null, nested objects and arrays. Does not implement anchors,
 * multi-line strings, flow style, or tags.
 */

export function jsonToYaml(value: unknown, indent = 0): string {
  return stringify(value, indent).trimEnd() + '\n';
}

function stringify(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);

  if (value === null || value === undefined) {
    return pad + 'null\n';
  }
  if (typeof value === 'string') {
    return pad + formatScalarString(value) + '\n';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return pad + String(value) + '\n';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return pad + '[]\n';
    let out = '';
    for (const item of value) {
      if (isPrimitive(item)) {
        out += pad + '- ' + scalarInline(item) + '\n';
      } else if (Array.isArray(item)) {
        out += pad + '-\n' + stringify(item, indent + 1);
      } else {
        const inner = stringify(item, indent + 1);
        const lines = inner.split('\n');
        lines[0] = pad + '- ' + lines[0].slice((indent + 1) * 2);
        out += lines.join('\n');
      }
    }
    return out;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return pad + '{}\n';
    let out = '';
    for (const [k, v] of entries) {
      if (isPrimitive(v)) {
        out += pad + k + ': ' + scalarInline(v) + '\n';
      } else if (Array.isArray(v) && v.length === 0) {
        out += pad + k + ': []\n';
      } else if (v && typeof v === 'object' && Object.keys(v as object).length === 0) {
        out += pad + k + ': {}\n';
      } else {
        out += pad + k + ':\n' + stringify(v, indent + 1);
      }
    }
    return out;
  }
  return pad + String(value) + '\n';
}

function isPrimitive(v: unknown): boolean {
  return v === null || v === undefined || ['string', 'number', 'boolean'].includes(typeof v);
}

function scalarInline(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return formatScalarString(v);
  return String(v);
}

function formatScalarString(s: string): string {
  if (s === '') return '""';
  if (/[\n"':#\[\]{}&*!|>%@`]/.test(s) || /^\s|\s$/.test(s) || /^(true|false|null|~|-?\d)/i.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

// ---------- YAML -> JSON ----------

export function yamlToJson(yaml: string): unknown {
  const lines = (yaml || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+#.*$/, ''))
    .filter((l) => l.trim() !== '' && !/^\s*#/.test(l));

  let index = 0;

  function indentOf(line: string): number {
    const m = line.match(/^( *)/);
    return m ? m[1].length : 0;
  }

  function parseValueLiteral(raw: string): unknown {
    const t = raw.trim();
    if (t === '' || t === '~' || t.toLowerCase() === 'null') return null;
    if (t.toLowerCase() === 'true') return true;
    if (t.toLowerCase() === 'false') return false;
    if (/^-?\d+$/.test(t)) return parseInt(t, 10);
    if (/^-?\d+\.\d+$/.test(t)) return parseFloat(t);
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      try { return JSON.parse(t.replace(/^'/, '"').replace(/'$/, '"')); } catch { return t.slice(1, -1); }
    }
    if (t === '[]') return [];
    if (t === '{}') return ({} as Record<string, unknown>);
    return t;
  }

  function parseBlock(currentIndent: number): unknown {
    if (index >= lines.length) return null;
    const first = lines[index];
    const firstIndent = indentOf(first);
    if (firstIndent < currentIndent) return null;

    if (first.trim().startsWith('- ')) {
      const arr: unknown[] = [];
      while (index < lines.length) {
        const line = lines[index];
        const i = indentOf(line);
        if (i < firstIndent) break;
        if (i > firstIndent) break;
        const content = line.slice(i);
        if (!content.startsWith('- ')) break;
        const rest = content.slice(2);
        index++;
        if (rest.trim() === '') {
          arr.push(parseBlock(firstIndent + 2));
        } else if (/^[^:]+:\s*(.*)?$/.test(rest) && !rest.startsWith('{') && !rest.startsWith('[')) {
          // inline map start
          const obj: Record<string, unknown> = {};
          const m = rest.match(/^([^:]+):\s*(.*)$/)!;
          if (m[2].trim() === '') {
            obj[m[1].trim()] = parseBlock(firstIndent + 2);
          } else {
            obj[m[1].trim()] = parseValueLiteral(m[2]);
          }
          // additional sibling keys belong to this item if more indented
          while (index < lines.length && indentOf(lines[index]) > firstIndent && !lines[index].slice(indentOf(lines[index])).startsWith('- ')) {
            const ln = lines[index];
            const ii = indentOf(ln);
            if (ii !== firstIndent + 2) break;
            const seg = ln.slice(ii);
            const km = seg.match(/^([^:]+):\s*(.*)$/);
            if (!km) break;
            index++;
            if (km[2].trim() === '') {
              obj[km[1].trim()] = parseBlock(ii + 2);
            } else {
              obj[km[1].trim()] = parseValueLiteral(km[2]);
            }
          }
          arr.push(obj);
        } else {
          arr.push(parseValueLiteral(rest));
        }
      }
      return arr;
    }

    const obj: Record<string, unknown> = {};
    while (index < lines.length) {
      const line = lines[index];
      const i = indentOf(line);
      if (i < firstIndent) break;
      if (i > firstIndent) break;
      const content = line.slice(i);
      const m = content.match(/^([^:]+):\s*(.*)$/);
      if (!m) break;
      const key = m[1].trim();
      const rest = m[2];
      index++;
      if (rest.trim() === '') {
        obj[key] = parseBlock(firstIndent + 2);
      } else {
        obj[key] = parseValueLiteral(rest);
      }
    }
    return obj;
  }

  return parseBlock(indentOf(lines[0] ?? ''));
}
