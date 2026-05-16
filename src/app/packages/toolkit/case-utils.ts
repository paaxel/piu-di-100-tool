export type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'upper' | 'lower' | 'title' | 'constant';

export interface CaseDefinition {
  id: CaseType;
  label: string;
  route: string;
}

export const CASES: CaseDefinition[] = [
  { id: 'camel', label: 'camelCase', route: 'camel-case' },
  { id: 'pascal', label: 'PascalCase', route: 'pascal-case' },
  { id: 'snake', label: 'snake_case', route: 'snake-case' },
  { id: 'kebab', label: 'kebab-case', route: 'kebab-case' },
  { id: 'constant', label: 'CONSTANT_CASE', route: 'constant-case' },
  { id: 'upper', label: 'UPPER CASE', route: 'upper-case' },
  { id: 'lower', label: 'lower case', route: 'lower-case' },
  { id: 'title', label: 'Title Case', route: 'title-case' },
];

export function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 0);
}

export function convertCase(input: string, type: CaseType): string {
  const words = tokenize(input);
  if (words.length === 0) return '';

  switch (type) {
    case 'camel':
      return words[0] + words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    case 'pascal':
      return words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'title':
      return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
    case 'constant':
      return words.join('_').toUpperCase();
  }
}
