import { tokenize, convertCase, CASES } from './case-utils';

describe('tokenize', () => {
  it('splits a plain sentence into lowercase words', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world']);
  });

  it('splits camelCase into tokens', () => {
    expect(tokenize('helloWorldFoo')).toEqual(['hello', 'world', 'foo']);
  });

  it('splits kebab-case and snake_case into tokens', () => {
    expect(tokenize('my-variable_name')).toEqual(['my', 'variable', 'name']);
  });
});

describe('convertCase', () => {
  it('converts to camelCase', () => {
    expect(convertCase('hello world foo', 'camel')).toBe('helloWorldFoo');
  });

  it('converts to PascalCase', () => {
    expect(convertCase('hello world', 'pascal')).toBe('HelloWorld');
  });

  it('converts to snake_case', () => {
    expect(convertCase('Hello World', 'snake')).toBe('hello_world');
  });

  it('converts to kebab-case', () => {
    expect(convertCase('Hello World', 'kebab')).toBe('hello-world');
  });

  it('converts to CONSTANT_CASE', () => {
    expect(convertCase('my variable name', 'constant')).toBe('MY_VARIABLE_NAME');
  });

  it('converts to UPPER CASE', () => {
    expect(convertCase('hello world', 'upper')).toBe('HELLO WORLD');
  });

  it('converts to lower case', () => {
    expect(convertCase('HELLO WORLD', 'lower')).toBe('hello world');
  });

  it('converts to Title Case', () => {
    expect(convertCase('hello world', 'title')).toBe('Hello World');
  });

  it('returns empty string for empty input', () => {
    expect(convertCase('', 'camel')).toBe('');
  });
});

describe('CASES', () => {
  it('contains all 8 case types', () => {
    expect(CASES).toHaveLength(8);
  });

  it('each definition has id, label, and route', () => {
    for (const c of CASES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.route).toBeTruthy();
    }
  });
});
