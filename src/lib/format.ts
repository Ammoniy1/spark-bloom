/** Форматирование как toLocaleString('ru-RU'): разделитель тысяч — неразрывный пробел. */
export function fmt(n: number, fractionDigits = 0): string {
  const fixed = n.toFixed(fractionDigits);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${grouped},${frac}` : grouped;
}

/** На Home: «1 день», иначе «N дн.» */
export const daysShort = (n: number) => (n === 1 ? '1 день' : `${n} дн.`);

/** В шаринге: день / дня / дней. */
export function daysWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'дня';
  return 'дней';
}
