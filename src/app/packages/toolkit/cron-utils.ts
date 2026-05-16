export interface CronField {
  raw: string;
  description: string;
}

export interface CronExplanation {
  fields: CronField[];
  summary: string;
  valid: boolean;
  error?: string;
}

const FIVE_LABELS = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];
const SIX_LABELS = ['second', 'minute', 'hour', 'day-of-month', 'month', 'day-of-week'];

const RANGES: Record<string, [number, number]> = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  'day-of-month': [1, 31],
  month: [1, 12],
  'day-of-week': [0, 7],
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function describeField(value: string, label: string): string {
  if (value === '*') return `every ${label}`;
  if (value.startsWith('*/')) return `every ${value.slice(2)} ${label}(s)`;

  const parts = value.split(',');
  const human = parts
    .map((p) => {
      if (p.includes('/')) {
        const [range, step] = p.split('/');
        return `every ${step} ${label}(s) starting at ${range === '*' ? '0' : range}`;
      }
      if (p.includes('-')) {
        const [from, to] = p.split('-');
        return `from ${prettyValue(from, label)} to ${prettyValue(to, label)}`;
      }
      return `at ${prettyValue(p, label)}`;
    })
    .join(', ');
  return human;
}

function prettyValue(v: string, label: string): string {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return v;
  if (label === 'month' && n >= 1 && n <= 12) return MONTH_NAMES[n - 1];
  if (label === 'day-of-week' && n >= 0 && n <= 7) return DOW_NAMES[n % 7];
  return v;
}

function validateField(value: string, label: string): string | null {
  if (value === '*' || value === '?') return null;
  const [min, max] = RANGES[label];
  const tokens = value.split(/[,\-\/]/).filter(Boolean);
  for (const t of tokens) {
    if (t === '*' || t === '?') continue;
    const n = parseInt(t, 10);
    if (Number.isNaN(n) || n < min || n > max) {
      return `Invalid value "${t}" for ${label} (expected ${min}-${max})`;
    }
  }
  return null;
}

export function explainCron(expression: string): CronExplanation {
  const trimmed = (expression || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return { fields: [], summary: '', valid: false, error: 'Empty expression' };
  }
  const parts = trimmed.split(' ');
  let labels: string[];
  if (parts.length === 5) labels = FIVE_LABELS;
  else if (parts.length === 6) labels = SIX_LABELS;
  else return { fields: [], summary: '', valid: false, error: 'Expression must have 5 or 6 fields' };

  const fields: CronField[] = [];
  for (let i = 0; i < parts.length; i++) {
    const err = validateField(parts[i], labels[i]);
    if (err) return { fields, summary: '', valid: false, error: err };
    fields.push({ raw: parts[i], description: describeField(parts[i], labels[i]) });
  }

  const summary = fields.map((f, i) => `${labels[i]}: ${f.description}`).join(' • ');
  return { fields, summary, valid: true };
}
