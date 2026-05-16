import { Loader } from './loader';

describe('Loader service', () => {
  it('toggles loading state', () => {
    const service = new Loader();
    let state = false;

    const sub = service.loading$.subscribe((value) => {
      state = value;
    });

    service.show();
    expect(state).toBe(true);

    service.hide();
    expect(state).toBe(false);

    sub.unsubscribe();
  });
});
