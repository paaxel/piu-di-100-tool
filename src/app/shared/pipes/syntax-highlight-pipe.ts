import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const SQL_KEYWORDS = new Set([
  'SELECT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL','BETWEEN','LIKE',
  'JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','ON',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE',
  'CREATE','TABLE','VIEW','INDEX','DROP','ALTER','ADD','COLUMN',
  'GROUP','BY','ORDER','ASC','DESC','HAVING','LIMIT','OFFSET','DISTINCT',
  'AS','WITH','UNION','ALL','INTERSECT','EXCEPT',
  'CASE','WHEN','THEN','ELSE','END','IF','EXISTS',
  'PRIMARY','KEY','FOREIGN','REFERENCES','UNIQUE','DEFAULT','CONSTRAINT',
  'BEGIN','COMMIT','ROLLBACK','TRANSACTION','DECLARE','PROCEDURE','FUNCTION','RETURNS',
  'INT','INTEGER','VARCHAR','TEXT','CHAR','DATE','DATETIME','TIMESTAMP',
  'BOOLEAN','FLOAT','DOUBLE','DECIMAL','NUMERIC',
]);

@Pipe({ name: 'syntaxHighlight', standalone: false })
export class SyntaxHighlightPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string, mode: 'json' | 'yaml' | 'sql' = 'json'): SafeHtml | '' {
    if (!value) return '';
    if (mode === 'sql') {
      return this.sanitizer.bypassSecurityTrustHtml(this.highlightSql(value));
    }
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = mode === 'yaml' ? this.highlightYaml(escaped) : this.highlightJson(escaped);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private highlightSql(sql: string): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const result: string[] = [];
    let i = 0;
    while (i < sql.length) {
      // Line comment
      if (sql.startsWith('--', i)) {
        const end = sql.indexOf('\n', i);
        const v = end === -1 ? sql.slice(i) : sql.slice(i, end);
        result.push(`<span class="hl-comment">${esc(v)}</span>`);
        i += v.length;
        continue;
      }
      // Block comment
      if (sql.startsWith('/*', i)) {
        const end = sql.indexOf('*/', i + 2);
        const v = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
        result.push(`<span class="hl-comment">${esc(v)}</span>`);
        i += v.length;
        continue;
      }
      // String literals
      if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
        const q = sql[i]; let j = i + 1;
        while (j < sql.length) {
          if (sql[j] === q && sql[j - 1] !== '\\') { j++; break; }
          j++;
        }
        result.push(`<span class="hl-string">${esc(sql.slice(i, j))}</span>`);
        i = j;
        continue;
      }
      // Word / keyword
      if (/[a-zA-Z_$]/.test(sql[i])) {
        let j = i;
        while (j < sql.length && /[\w$]/.test(sql[j])) j++;
        const word = sql.slice(i, j);
        result.push(SQL_KEYWORDS.has(word.toUpperCase())
          ? `<span class="hl-key">${esc(word)}</span>`
          : esc(word));
        i = j;
        continue;
      }
      // Number
      if (/[0-9]/.test(sql[i])) {
        let j = i;
        while (j < sql.length && /[\d.]/.test(sql[j])) j++;
        result.push(`<span class="hl-number">${esc(sql.slice(i, j))}</span>`);
        i = j;
        continue;
      }
      result.push(esc(sql[i]));
      i++;
    }
    return result.join('');
  }

  private highlightJson(json: string): string {
    return json.replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (match.startsWith('"')) {
          return match.trimEnd().endsWith(':')
            ? `<span class="hl-key">${match}</span>`
            : `<span class="hl-string">${match}</span>`;
        }
        if (match === 'true' || match === 'false') return `<span class="hl-boolean">${match}</span>`;
        if (match === 'null') return `<span class="hl-null">${match}</span>`;
        return `<span class="hl-number">${match}</span>`;
      },
    );
  }

  private highlightYaml(yaml: string): string {
    return yaml
      .split('\n')
      .map((line) => {
        if (/^\s*#/.test(line)) return `<span class="hl-comment">${line}</span>`;
        const keyMatch = line.match(/^(\s*(?:-\s+)?)([^:#\s][^:]*?)(\s*:)(.*)$/);
        if (keyMatch) {
          const [, lead, key, colon, rest] = keyMatch;
          return `${lead}<span class="hl-key">${key}</span>${colon}${this.highlightYamlValue(rest)}`;
        }
        return line;
      })
      .join('\n');
  }

  private highlightYamlValue(val: string): string {
    if (!val || val.trim() === '') return val;
    const trimmed = val.trim();
    if (trimmed.startsWith('#')) {
      const idx = val.indexOf('#');
      return val.slice(0, idx) + `<span class="hl-comment">${val.slice(idx)}</span>`;
    }
    if (/^['"]/.test(trimmed)) return ` <span class="hl-string">${trimmed}</span>`;
    if (/^(true|false)$/.test(trimmed)) return ` <span class="hl-boolean">${trimmed}</span>`;
    if (/^null$/.test(trimmed)) return ` <span class="hl-null">${trimmed}</span>`;
    if (/^-?\d/.test(trimmed)) return ` <span class="hl-number">${trimmed}</span>`;
    if (trimmed.startsWith('|') || trimmed.startsWith('>')) return val;
    return ` <span class="hl-string">${trimmed}</span>`;
  }
}
