import '@angular/compiler';
import { UuidGenerator } from './uuid-generator';

const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('UuidGenerator', () => {
  it('generates a UUID v4 matching the standard format', () => {
    const comp = new UuidGenerator(cdr, seo);
    comp.type = 'uuid';
    comp.count = 1;
    comp.generate();
    expect(comp.results).toHaveLength(1);
    expect(comp.results[0]).toMatch(UUID_V4_RE);
  });

  it('generates the requested number of UUIDs', () => {
    const comp = new UuidGenerator(cdr, seo);
    comp.type = 'uuid';
    comp.count = 3;
    comp.generate();
    expect(comp.results).toHaveLength(3);
  });

  it('generates ULID identifiers of length 26', () => {
    const comp = new UuidGenerator(cdr, seo);
    comp.type = 'ulid';
    comp.count = 2;
    comp.generate();
    expect(comp.results).toHaveLength(2);
    for (const ulid of comp.results) {
      expect(ulid).toHaveLength(26);
    }
  });
});

