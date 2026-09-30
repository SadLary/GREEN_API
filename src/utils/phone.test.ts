import { describe, expect, it } from 'vitest';
import { formatPhone, isValidInternationalPhone, normalizePhone } from './phone';

describe('phone helpers', () => {
  it('normalizes formatted phone numbers', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('validates international number length', () => {
    expect(isValidInternationalPhone('+7 (999) 123-45-67')).toBe(true);
    expect(isValidInternationalPhone('123')).toBe(false);
  });

  it('formats normalized numbers for display', () => {
    expect(formatPhone('79991234567')).toBe('+79991234567');
  });
});
