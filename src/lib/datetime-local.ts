const ISTANBUL_OFFSET_MINUTES = 180; // UTC+3, Türkiye'de yaz saati uygulanmıyor

/**
 * `<input type="datetime-local">` yerel saat bekler ve saat dilimi taşımaz.
 * Değerleri her zaman Türkiye saatine göre üretip okuyoruz ki yöneticinin
 * gördüğü saat ile yayın saati aynı olsun.
 */
export function toDateTimeLocal(value: Date | null | undefined): string {
  if (!value) return '';

  const shifted = new Date(value.getTime() + ISTANBUL_OFFSET_MINUTES * 60_000);

  return shifted.toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value: string): Date | null {
  if (!value) return null;

  const parsed = new Date(`${value}:00+03:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
