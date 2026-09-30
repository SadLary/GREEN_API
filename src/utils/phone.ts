export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidInternationalPhone(value: string): boolean {
  return /^\d{7,15}$/.test(normalizePhone(value));
}

export function formatPhone(value: string): string {
  const normalized = normalizePhone(value);
  return normalized ? `+${normalized}` : value;
}
