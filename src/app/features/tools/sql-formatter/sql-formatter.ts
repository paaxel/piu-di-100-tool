import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

// ─── Minimal SQL Formatter ────────────────────────────────────────────────────
// Tokenizer: splits into keywords, identifiers, operators, strings, comments

type TokenType = 'KEYWORD' | 'WORD' | 'STRING' | 'COMMENT' | 'PAREN_OPEN' | 'PAREN_CLOSE' | 'COMMA' | 'OP' | 'SEMI';

interface Token { type: TokenType; value: string; }

const KEYWORDS = new Set([
  'SELECT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL','BETWEEN','LIKE',
  'JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','ON',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE',
  'CREATE','TABLE','VIEW','INDEX','DROP','ALTER','ADD','COLUMN',
  'GROUP','BY','ORDER','ASC','DESC','HAVING','LIMIT','OFFSET','DISTINCT',
  'AS','WITH','UNION','ALL','INTERSECT','EXCEPT',
  'CASE','WHEN','THEN','ELSE','END','IF','EXISTS',
  'PRIMARY','KEY','FOREIGN','REFERENCES','UNIQUE','DEFAULT','NOT','NULL','CONSTRAINT',
  'BEGIN','COMMIT','ROLLBACK','TRANSACTION','DECLARE','PROCEDURE','FUNCTION','RETURNS',
  'INT','INTEGER','VARCHAR','TEXT','CHAR','DATE','DATETIME','TIMESTAMP','BOOLEAN','FLOAT','DOUBLE','DECIMAL','NUMERIC',
]);

// Clause-level keywords that start a new line at indent 0
const CLAUSE_KEYWORDS = new Set([
  'SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET',
  'JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN','CROSS JOIN',
  'INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE',
  'CREATE VIEW','DROP TABLE','ALTER TABLE','UNION','UNION ALL',
  'INTERSECT','EXCEPT','WITH',
]);

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    // Whitespace
    if (/\s/.test(sql[i])) { i++; continue; }
    // Line comment
    if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i);
      const v = end === -1 ? sql.slice(i) : sql.slice(i, end);
      tokens.push({ type: 'COMMENT', value: v }); i += v.length; continue;
    }
    // Block comment
    if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2);
      const v = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
      tokens.push({ type: 'COMMENT', value: v }); i += v.length; continue;
    }
    // String literals
    if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
      const q = sql[i]; let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === q && sql[j - 1] !== '\\') { j++; break; }
        j++;
      }
      tokens.push({ type: 'STRING', value: sql.slice(i, j) }); i = j; continue;
    }
    // Parens
    if (sql[i] === '(') { tokens.push({ type: 'PAREN_OPEN', value: '(' }); i++; continue; }
    if (sql[i] === ')') { tokens.push({ type: 'PAREN_CLOSE', value: ')' }); i++; continue; }
    if (sql[i] === ',') { tokens.push({ type: 'COMMA', value: ',' }); i++; continue; }
    if (sql[i] === ';') { tokens.push({ type: 'SEMI', value: ';' }); i++; continue; }
    // Word / keyword
    if (/[a-zA-Z_$]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[\w$]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      tokens.push({ type: KEYWORDS.has(upper) ? 'KEYWORD' : 'WORD', value: word }); i = j; continue;
    }
    // Operators / other single chars
    tokens.push({ type: 'OP', value: sql[i] }); i++; continue;
  }
  return tokens;
}

function format(sql: string, indent: string): string {
  if (!sql.trim()) return '';
  const tokens = tokenize(sql);
  const lines: string[] = [];
  let depth = 0;
  let line = '';

  const push = () => { if (line.trim()) lines.push(line); line = ''; };
  const pad = () => indent.repeat(depth);

  const addToLine = (v: string) => {
    line = line ? line + ' ' + v : pad() + v;
  };

  // Merge multi-word clause keywords (GROUP BY, ORDER BY, etc.)
  const merged: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'KEYWORD') {
      const next = tokens[i + 1];
      if (next?.type === 'KEYWORD') {
        const compound = (tokens[i].value + ' ' + next.value).toUpperCase();
        if (CLAUSE_KEYWORDS.has(compound)) {
          merged.push({ type: 'KEYWORD', value: compound }); i++; continue;
        }
      }
    }
    merged.push(tokens[i]);
  }

  for (let i = 0; i < merged.length; i++) {
    const tok = merged[i];
    const upper = tok.value.toUpperCase();

    if (tok.type === 'SEMI') { addToLine(';'); push(); continue; }

    if (tok.type === 'PAREN_OPEN') {
      const next = merged[i + 1];
      if (next?.type === 'KEYWORD' && (next.value.toUpperCase() === 'SELECT')) {
        addToLine('('); push(); depth++; continue;
      }
      line = line ? line + '(' : pad() + '('; continue;
    }

    if (tok.type === 'PAREN_CLOSE') {
      if (line.trim()) push();
      if (depth > 0) depth--;
      line = pad() + ')'; continue;
    }

    if (tok.type === 'COMMA') {
      line += ','; push(); line = pad(); continue;
    }

    if (tok.type === 'COMMENT') { push(); lines.push(pad() + tok.value); continue; }

    if (tok.type === 'KEYWORD') {
      if (CLAUSE_KEYWORDS.has(upper)) {
        push();
        if (depth === 0) {
          lines.push(upper);
          line = pad() + indent;
        } else {
          lines.push(pad() + upper);
          line = pad() + indent;
        }
        continue;
      }
      if (upper === 'AND' || upper === 'OR') {
        push(); line = pad() + upper + ' '; continue;
      }
      if (upper === 'CASE') {
        addToLine('CASE'); depth++; continue;
      }
      if (upper === 'END') {
        push(); depth--; addToLine('END'); continue;
      }
      if (upper === 'WHEN' || upper === 'THEN' || upper === 'ELSE') {
        push(); addToLine(upper); continue;
      }
      addToLine(upper); continue;
    }

    addToLine(tok.value);
  }
  if (line.trim()) lines.push(line);
  return lines.join('\n');
}

@Component({
  selector: 'app-sql-formatter',
  standalone: false,
  templateUrl: './sql-formatter.html',
})
export class SqlFormatter {
  readonly form: FormGroup;
  output = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Formattatore SQL', 'Formatta e abbellisce query SQL online. Indentazione automatica per SELECT, JOIN, WHERE e molto altro.');
    this.form = fb.group({ sql: [''], indent: ['  '] });
  }

  formatSql(): void {
    const { sql, indent } = this.form.value;
    try {
      this.output = format(sql ?? '', indent === 'tab' ? '\t' : '  ');
    } catch {
      this.output = sql;
    }
  }

  clear(): void { this.form.patchValue({ sql: '' }); this.output = ''; }

  clearOutput(): void { this.output = ''; }
}
