import '@angular/compiler';
import { TestaOCroce } from './testa-o-croce';

const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('TestaOCroce', () => {
  it('starts with result=null and zero counters', () => {
    const comp = new TestaOCroce(cdr, seo);
    expect(comp.result).toBeNull();
    expect(comp.heads).toBe(0);
    expect(comp.tails).toBe(0);
  });

  it('reset() clears result and counters', () => {
    const comp = new TestaOCroce(cdr, seo);
    comp.heads = 3;
    comp.tails = 2;
    comp.result = 'heads';
    comp.reset();
    expect(comp.result).toBeNull();
    expect(comp.heads).toBe(0);
    expect(comp.tails).toBe(0);
  });

  it('does not flip a second time while already flipping', () => {
    vi.useFakeTimers();
    const comp = new TestaOCroce(cdr, seo);
    comp.flip(); // First flip - sets isFlipping = true
    comp.flip(); // Should be ignored while flipping
    vi.runAllTimers();
    // Only one flip completed → heads + tails === 1
    expect(comp.heads + comp.tails).toBe(1);
    vi.useRealTimers();
  });
});

