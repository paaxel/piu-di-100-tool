export type UnitCategory = 'length' | 'mass' | 'volume' | 'temperature' | 'speed';

export interface UnitDefinition {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export const UNITS: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: 'm',   label: 'TOOLS.UNITS.LABELS.m',       toBase: (v) => v,             fromBase: (v) => v },
    { id: 'km',  label: 'TOOLS.UNITS.LABELS.km',      toBase: (v) => v * 1000,      fromBase: (v) => v / 1000 },
    { id: 'cm',  label: 'TOOLS.UNITS.LABELS.cm',      toBase: (v) => v / 100,       fromBase: (v) => v * 100 },
    { id: 'mm',  label: 'TOOLS.UNITS.LABELS.mm',      toBase: (v) => v / 1000,      fromBase: (v) => v * 1000 },
    { id: 'in',  label: 'TOOLS.UNITS.LABELS.in',      toBase: (v) => v * 0.0254,    fromBase: (v) => v / 0.0254 },
    { id: 'ft',  label: 'TOOLS.UNITS.LABELS.ft',      toBase: (v) => v * 0.3048,    fromBase: (v) => v / 0.3048 },
    { id: 'yd',  label: 'TOOLS.UNITS.LABELS.yd',      toBase: (v) => v * 0.9144,    fromBase: (v) => v / 0.9144 },
    { id: 'mi',  label: 'TOOLS.UNITS.LABELS.mi',      toBase: (v) => v * 1609.344,  fromBase: (v) => v / 1609.344 },
  ],
  mass: [
    { id: 'g',   label: 'TOOLS.UNITS.LABELS.g',       toBase: (v) => v,             fromBase: (v) => v },
    { id: 'kg',  label: 'TOOLS.UNITS.LABELS.kg',      toBase: (v) => v * 1000,      fromBase: (v) => v / 1000 },
    { id: 'mg',  label: 'TOOLS.UNITS.LABELS.mg',      toBase: (v) => v / 1000,      fromBase: (v) => v * 1000 },
    { id: 't',   label: 'TOOLS.UNITS.LABELS.t',       toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000 },
    { id: 'oz',  label: 'TOOLS.UNITS.LABELS.oz',      toBase: (v) => v * 28.3495,   fromBase: (v) => v / 28.3495 },
    { id: 'lb',  label: 'TOOLS.UNITS.LABELS.lb',      toBase: (v) => v * 453.592,   fromBase: (v) => v / 453.592 },
    { id: 'st',  label: 'TOOLS.UNITS.LABELS.st',      toBase: (v) => v * 6350.29,   fromBase: (v) => v / 6350.29 },
  ],
  volume: [
    { id: 'l',       label: 'TOOLS.UNITS.LABELS.l',       toBase: (v) => v,             fromBase: (v) => v },
    { id: 'ml',      label: 'TOOLS.UNITS.LABELS.ml',      toBase: (v) => v / 1000,      fromBase: (v) => v * 1000 },
    { id: 'm3',      label: 'TOOLS.UNITS.LABELS.m3',      toBase: (v) => v * 1000,      fromBase: (v) => v / 1000 },
    { id: 'gal_us',  label: 'TOOLS.UNITS.LABELS.gal_us',  toBase: (v) => v * 3.78541,   fromBase: (v) => v / 3.78541 },
    { id: 'qt_us',   label: 'TOOLS.UNITS.LABELS.qt_us',   toBase: (v) => v * 0.946353,  fromBase: (v) => v / 0.946353 },
    { id: 'pt_us',   label: 'TOOLS.UNITS.LABELS.pt_us',   toBase: (v) => v * 0.473176,  fromBase: (v) => v / 0.473176 },
    { id: 'cup_us',  label: 'TOOLS.UNITS.LABELS.cup_us',  toBase: (v) => v * 0.24,      fromBase: (v) => v / 0.24 },
    { id: 'floz_us', label: 'TOOLS.UNITS.LABELS.floz_us', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
  ],
  temperature: [
    { id: 'c', label: 'TOOLS.UNITS.LABELS.c', toBase: (v) => v,                      fromBase: (v) => v },
    { id: 'f', label: 'TOOLS.UNITS.LABELS.f', toBase: (v) => (v - 32) * (5 / 9),     fromBase: (v) => v * (9 / 5) + 32 },
    { id: 'k', label: 'TOOLS.UNITS.LABELS.k', toBase: (v) => v - 273.15,             fromBase: (v) => v + 273.15 },
  ],
  speed: [
    { id: 'mps', label: 'TOOLS.UNITS.LABELS.mps', toBase: (v) => v,          fromBase: (v) => v },
    { id: 'kph', label: 'TOOLS.UNITS.LABELS.kph', toBase: (v) => v / 3.6,    fromBase: (v) => v * 3.6 },
    { id: 'mph', label: 'TOOLS.UNITS.LABELS.mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { id: 'kn',  label: 'TOOLS.UNITS.LABELS.kn',  toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  ],
};

export function convertUnit(category: UnitCategory, from: string, to: string, value: number): number {
  const list = UNITS[category];
  const f = list.find((u) => u.id === from);
  const t = list.find((u) => u.id === to);
  if (!f || !t) return NaN;
  return t.fromBase(f.toBase(value));
}
