const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MONTH_CODES: Record<number, string> = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'H',
  7: 'L',
  8: 'M',
  9: 'P',
  10: 'R',
  11: 'S',
  12: 'T',
};

const ODD_MAP: Record<string, number> = {
  '0': 1,
  '1': 0,
  '2': 5,
  '3': 7,
  '4': 9,
  '5': 13,
  '6': 15,
  '7': 17,
  '8': 19,
  '9': 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
};

const EVEN_MAP: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
};

export const GENDER_MALE = 'M';
export const GENDER_FEMALE = 'F';

export type PlaceCodeMap = Record<string, string>;

function padCode(value: string): string {
  return (value + 'XXX').slice(0, 3);
}

function onlyLetters(value: string): string {
  return value.replace(/[^A-Z]/g, '');
}

function splitConsonantsAndVowels(value: string): { consonants: string; vowels: string } {
  const letters = onlyLetters(normalizeName(value));
  const consonants = letters
    .split('')
    .filter((char) => !VOWELS.includes(char))
    .join('');
  const vowels = letters
    .split('')
    .filter((char) => VOWELS.includes(char))
    .join('');

  return { consonants, vowels };
}

export function normalizeName(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function createSurnameCode(surname: string): string {
  const chunks = splitConsonantsAndVowels(surname);
  return padCode(chunks.consonants + chunks.vowels);
}

export function createNameCode(name: string): string {
  const chunks = splitConsonantsAndVowels(name);
  if (chunks.consonants.length >= 4) {
    return chunks.consonants[0] + chunks.consonants[2] + chunks.consonants[3];
  }
  return padCode(chunks.consonants + chunks.vowels);
}

export function createMonthCode(month: number): string {
  return MONTH_CODES[month] ?? 'A';
}

export function createDayCode(day: number, gender: string): string {
  const encodedDay = gender === GENDER_FEMALE ? day + 40 : day;
  return encodedDay.toString().padStart(2, '0');
}

export function resolvePlaceCode(place: string, placeCodeMap: PlaceCodeMap): string {
  return placeCodeMap[place] ?? 'Z404';
}

export function calculateControlCharacter(partialCode: string): string {
  const normalized = normalizeName(partialCode);
  const total = normalized.split('').reduce((acc, char, index) => {
    const map = (index + 1) % 2 === 0 ? EVEN_MAP : ODD_MAP;
    return acc + (map[char] ?? 0);
  }, 0);

  return String.fromCharCode((total % 26) + 65);
}

// ---------- Inverse (decode) ----------

export interface CodiceFiscaleDecoded {
  surnameCode: string;
  nameCode: string;
  year: string;
  month: number;
  day: number;
  gender: string;
  placeCode: string;
  placeName: string | null;
  controlChar: string;
  valid: boolean;
}

const MONTH_CODE_TO_NUMBER: Record<string, number> = Object.fromEntries(
  Object.entries(MONTH_CODES).map(([k, v]) => [v, Number(k)]),
);

const CF_REGEX = /^[A-Z]{6}\d{2}[ABCDEHLMPRST]\d{2}[A-Z]\d{3}[A-Z]$/i;

export function decodeFiscalCode(cf: string, placeCodeMap: PlaceCodeMap): CodiceFiscaleDecoded {
  const code = normalizeName(cf);

  const valid = CF_REGEX.test(code) && calculateControlCharacter(code.slice(0, 15)) === code[15];

  const surnameCode = code.slice(0, 3);
  const nameCode = code.slice(3, 6);

  const yearPart = code.slice(6, 8);
  const monthLetter = code.slice(8, 9).toUpperCase();
  const dayPart = parseInt(code.slice(9, 11), 10);

  const month = MONTH_CODE_TO_NUMBER[monthLetter] ?? 0;
  const gender = dayPart > 40 ? GENDER_FEMALE : GENDER_MALE;
  const day = gender === GENDER_FEMALE ? dayPart - 40 : dayPart;

  const placeCode = code.slice(11, 15);
  const controlChar = code.slice(15, 16);

  // Reverse-lookup place name from placeCode
  const placeName =
    Object.entries(placeCodeMap).find(([, v]) => v === placeCode)?.[0] ?? null;

  return { surnameCode, nameCode, year: yearPart, month, day, gender, placeCode, placeName, controlChar, valid };
}
